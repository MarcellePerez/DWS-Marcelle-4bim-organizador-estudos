const prisma = require('../config/prisma');
const HttpError = require('../utils/http-error');

const priorities = new Set(['BAIXA', 'MEDIA', 'ALTA']);

function parseTaskData(body) {
  const deadline = new Date(body.deadline);
  if (!body.title?.trim() || !body.discipline?.trim() || Number.isNaN(deadline.getTime())) {
    throw new HttpError(400, 'Título, disciplina e prazo válido são obrigatórios.');
  }
  if (!priorities.has(body.priority)) {
    throw new HttpError(400, 'A prioridade deve ser BAIXA, MEDIA ou ALTA.');
  }
  return {
    title: body.title.trim(),
    discipline: body.discipline.trim(),
    deadline,
    priority: body.priority,
    parentId: body.parentId || null,
  };
}

async function ensureParentBelongsToUser(parentId, userId, taskId) {
  if (!parentId) return;
  if (parentId === taskId) throw new HttpError(400, 'Uma tarefa não pode ser sua própria pendência.');
  const parent = await prisma.task.findFirst({ where: { id: parentId, userId } });
  if (!parent) throw new HttpError(404, 'Tarefa principal não encontrada.');
}

async function list(userId) {
  return prisma.task.findMany({
    where: { userId },
    include: { subTasks: { select: { id: true, title: true, completed: true } } },
    orderBy: [{ completed: 'asc' }, { deadline: 'asc' }],
  });
}

async function create(body, userId) {
  const data = parseTaskData(body);
  await ensureParentBelongsToUser(data.parentId, userId);
  return prisma.task.create({ data: { ...data, userId } });
}

async function update(id, body, userId) {
  const current = await prisma.task.findFirst({ where: { id, userId } });
  if (!current) throw new HttpError(404, 'Tarefa não encontrada.');
  const data = parseTaskData({ ...current, ...body });
  await ensureParentBelongsToUser(data.parentId, userId, id);

  if (body.completed === true) {
    const pending = await prisma.task.count({ where: { parentId: id, completed: false } });
    if (pending > 0) {
      throw new HttpError(409, 'Conclua todas as pendências antes de concluir esta tarefa.');
    }
  }

  return prisma.task.update({ where: { id }, data: { ...data, completed: body.completed ?? current.completed } });
}

async function remove(id, userId) {
  const task = await prisma.task.findFirst({ where: { id, userId } });
  if (!task) throw new HttpError(404, 'Tarefa não encontrada.');
  await prisma.task.delete({ where: { id } });
}

module.exports = { list, create, update, remove };
