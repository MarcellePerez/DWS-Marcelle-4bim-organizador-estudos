const prisma = require('../config/database');

// Listar todas as tarefas do usuário autenticado
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

// Criar nova tarefa
exports.create = async (req, res) => {
  try {
    const { title, discipline, deadline, priority, parentId } = req.body;

    if (!title || !discipline || !deadline || !priority) {
      return res.status(400).json({ error: 'Preencha título, disciplina, prazo e prioridade.' });
    }

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

// Atualizar tarefa (COM A REGRA DE NEGÓCIO EXIGIDA)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, discipline, deadline, priority, completed } = req.body;

    const task = await prisma.task.findFirst({
      where: { id, userId: req.userId },
      include: { subTasks: true }
    });

    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    // REGRA DE NEGÓCIO DO EDITAL:
    // Impedir a conclusão se houver subtarefas pendentes vinculadas
    if (completed === true) {
      const pendingSubtasks = task.subTasks.filter(st => !st.completed);
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
        completed: completed !== undefined ? completed : task.completed
      }
    });

    return res.json(updatedTask);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar tarefa.' });
  }
};

// Deletar tarefa
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: { id, userId: req.userId }
    });

    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    await prisma.task.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao excluir tarefa.' });
  }
};