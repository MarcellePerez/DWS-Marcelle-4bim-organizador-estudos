process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test?schema=public';
process.env.JWT_SECRET ||= 'test-secret-for-validation-only';

const assert = require('node:assert/strict');
const test = require('node:test');
const prisma = require('../src/config/database');
const authService = require('../src/services/auth-service');
const taskService = require('../src/services/task-service');

async function withTaskMocks(mocks, run) {
  const originals = Object.fromEntries(
    Object.keys(mocks).map((method) => [method, prisma.task[method]]),
  );
  Object.assign(prisma.task, mocks);
  try {
    await run();
  } finally {
    Object.assign(prisma.task, originals);
  }
}

test('rejects registration with an invalid email before using the database', async () => {
  await assert.rejects(
    authService.register({ name: 'Pessoa', email: 'email-invalido', password: 'senha123' }),
    (error) => error.status === 400,
  );
});

test('rejects registration with a short password', async () => {
  await assert.rejects(
    authService.register({ name: 'Pessoa', email: 'pessoa@example.com', password: '12345' }),
    (error) => error.status === 400,
  );
});

test('rejects task creation with a missing title', async () => {
  await assert.rejects(
    taskService.create({
      discipline: 'Matemática',
      deadline: '2026-11-27T23:59:59.000Z',
      priority: 'MEDIA',
    }, 'user-id'),
    (error) => error.status === 400,
  );
});

test('rejects task creation with an invalid deadline or priority', async (context) => {
  const task = {
    title: 'Estudar',
    discipline: 'Matemática',
    deadline: 'data-inválida',
    priority: 'MEDIA',
  };

  await context.test('invalid deadline', async () => {
    await assert.rejects(taskService.create(task, 'user-id'), (error) => error.status === 400);
  });

  await context.test('unsupported priority', async () => {
    await assert.rejects(
      taskService.create({ ...task, deadline: '2026-11-27T23:59:59.000Z', priority: 'URGENTE' }, 'user-id'),
      (error) => error.status === 400,
    );
  });
});

test('prevents completing a main task with pending subtasks', async () => {
  const mainTask = {
    id: 'main-task',
    title: 'Estudar',
    discipline: 'Matemática',
    deadline: new Date('2026-11-27T23:59:59.000Z'),
    priority: 'MEDIA',
    completed: false,
    deletedAt: null,
    parentId: null,
  };

  await withTaskMocks({
    findFirst: async () => mainTask,
    count: async ({ where }) => {
      assert.deepEqual(where, { parentId: 'main-task', completed: false, deletedAt: null });
      return 1;
    },
  }, async () => {
    await assert.rejects(
      taskService.update('main-task', { completed: true }, 'user-id'),
      (error) => error.status === 409,
    );
  });
});

test("does not allow linking a task to another user's main task", async () => {
  await withTaskMocks({
    findFirst: async () => null,
  }, async () => {
    await assert.rejects(
      taskService.create({
        title: 'Subtarefa',
        discipline: 'Matemática',
        deadline: '2026-11-27T23:59:59.000Z',
        priority: 'MEDIA',
        parentId: 'foreign-task',
      }, 'user-id'),
      (error) => error.status === 404,
    );
  });
});

test('does not allow adding pending subtasks to a completed task', async () => {
  await withTaskMocks({
    findFirst: async () => ({
      id: 'completed-task',
      parentId: null,
      deletedAt: null,
      completed: true,
    }),
  }, async () => {
    await assert.rejects(
      taskService.create({
        title: 'Subtarefa',
        discipline: 'Matemática',
        deadline: '2026-11-27T23:59:59.000Z',
        priority: 'MEDIA',
        parentId: 'completed-task',
      }, 'user-id'),
      (error) => error.status === 409,
    );
  });
});
