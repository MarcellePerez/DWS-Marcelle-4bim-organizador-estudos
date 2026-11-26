const prisma = require('../config/database');
const HttpError = require('../utils/http-error');

const priorities = new Set(['BAIXA', 'MEDIA', 'ALTA']);

function parseTaskData(body) {
  const title = body.title;
  const discipline = body.discipline;
  const deadline = new Date(body.deadline);

  if (
    typeof title !== 'string'
    || !title.trim()
    || title.trim().length > 191
    || typeof discipline !== 'string'
    || !discipline.trim()
    || discipline.trim().length > 191
    || (typeof body.deadline !== 'string' && !(body.deadline instanceof Date))
    || Number.isNaN(deadline.getTime())
  ) {
    throw new HttpError(400, 'Título, disciplina e prazo válido são obrigatórios.');
  }
  if (!priorities.has(body.priority)) {
    throw new HttpError(400, 'A prioridade deve ser BAIXA, MEDIA ou ALTA.');
  }
  if (body.parentId !== undefined && body.parentId !== null && typeof body.parentId !== 'string') {
    throw new HttpError(400, 'A tarefa principal informada é inválida.');
  }

  return {
    title: title.trim(),
    discipline: discipline.trim(),
    deadline,
    priority: body.priority,
    parentId: body.parentId || null,
  };
}

async function ensureParentBelongsToUser(parentId, userId, taskId) {
  if (!parentId) return;
  if (parentId === taskId) throw new HttpError(400, 'Uma tarefa não pode ser sua própria pendência.');
  const parent = await prisma.task.findFirst({
    where: { id: parentId, userId },
    select: { id: true, parentId: true, deletedAt: true, completed: true },
  });
  if (!parent) throw new HttpError(404, 'Tarefa principal não encontrada.');
  if (parent.parentId || parent.deletedAt) {
    throw new HttpError(400, 'Escolha uma tarefa principal ativa, sem outra tarefa principal.');
  }
  if (parent.completed) {
    throw new HttpError(409, 'Não é possível adicionar pendências a uma tarefa concluída.');
  }
}

async function list(userId) {
  return prisma.task.findMany({
    where: { userId },
    include: {
      subTasks: { select: { id: true, title: true, completed: true, deletedAt: true } },
    },
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

  if (body.completed !== undefined && typeof body.completed !== 'boolean') {
    throw new HttpError(400, 'A situação da tarefa é inválida.');
  }

  if (body.completed === true) {
    const pending = await prisma.task.count({
      where: { parentId: id, completed: false, deletedAt: null },
    });
    if (pending > 0) {
      throw new HttpError(409, 'Conclua todas as pendências antes de concluir esta tarefa.');
    }
  }

  let deletedAt = current.deletedAt;
  if (body.deletedAt !== undefined) {
    if (body.deletedAt === null) {
      deletedAt = null;
    } else {
      if (typeof body.deletedAt !== 'string') {
        throw new HttpError(400, 'A data de exclusão informada é inválida.');
      }
      deletedAt = new Date(body.deletedAt);
      if (Number.isNaN(deletedAt.getTime())) {
        throw new HttpError(400, 'A data de exclusão informada é inválida.');
      }
    }
  }

  if (data.parentId && !current.parentId) {
    const subTaskCount = await prisma.task.count({ where: { parentId: id } });
    if (subTaskCount > 0) {
      throw new HttpError(409, 'Uma tarefa principal com pendências não pode virar uma subtarefa.');
    }
  }

  return prisma.task.update({
    where: { id },
    data: {
      ...data,
      completed: body.completed ?? current.completed,
      deletedAt,
    },
  });
}

async function remove(id, userId, permanent = false) {
  const task = await prisma.task.findFirst({ where: { id, userId } });
  if (!task) throw new HttpError(404, 'Tarefa não encontrada.');

  if (permanent || task.deletedAt) {
    await prisma.task.delete({ where: { id } });
    return;
  }

  await prisma.task.update({ where: { id }, data: { deletedAt: new Date() } });
}

module.exports = { list, create, update, remove };
