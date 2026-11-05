const prisma = require('../config/database');

// Listar tarefas (todas incluindo a lixeira)
exports.list = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      include: { subTasks: true }
    });
    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar tarefas.' });
  }
};

// Criar tarefa
exports.create = async (req, res) => {
  try {
    const { title, discipline, deadline, priority, parentId } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        discipline,
        deadline: new Date(deadline),
        priority,
        parentId: parentId || null,
        userId: req.userId
      }
    });
    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar tarefa.' });
  }
};

// Atualizar tarefa (com suporte para restaurar e atualizar status/dados)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, discipline, deadline, priority, completed, deletedAt } = req.body;

    const task = await prisma.task.findFirst({
      where: { id, userId: req.userId },
      include: { subTasks: true }
    });

    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    if (completed === true) {
      const pendingSubtasks = task.subTasks.filter(st => !st.completed && !st.deletedAt);
      if (pendingSubtasks.length > 0) {
        return res.status(400).json({
          error: 'Regra de negócio: Não é possível concluir esta tarefa pois existem subtarefas pendentes vinculadas a ela.'
        });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title: title !== undefined ? title : task.title,
        discipline: discipline !== undefined ? discipline : task.discipline,
        deadline: deadline ? new Date(deadline) : task.deadline,
        priority: priority !== undefined ? priority : task.priority,
        completed: completed !== undefined ? completed : task.completed,
        deletedAt: deletedAt !== undefined ? (deletedAt ? new Date(deletedAt) : null) : task.deletedAt
      }
    });

    return res.json(updatedTask);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar tarefa.' });
  }
};

// Mover para a Lixeira (Soft Delete) ou Excluir Permanentemente
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const permanent = req.query.permanent === 'true';

    const task = await prisma.task.findFirst({
      where: { id, userId: req.userId }
    });

    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    if (permanent || task.deletedAt) {
      // Exclusão física definitiva do banco de dados
      await prisma.task.delete({ where: { id } });
    } else {
      // Soft Delete: Move para a Lixeira
      await prisma.task.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao excluir tarefa.' });
  }
};