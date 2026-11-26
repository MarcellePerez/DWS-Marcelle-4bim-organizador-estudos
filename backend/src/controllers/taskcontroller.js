const taskService = require('../services/task-service');

exports.list = async (req, res) => {
  const tasks = await taskService.list(req.userId);
  return res.json(tasks);
};

exports.create = async (req, res) => {
  const task = await taskService.create(req.body || {}, req.userId);
  return res.status(201).json(task);
};

exports.update = async (req, res) => {
  const task = await taskService.update(req.params.id, req.body || {}, req.userId);
  return res.json(task);
};

exports.delete = async (req, res) => {
  await taskService.remove(req.params.id, req.userId, req.query.permanent === 'true');
  return res.status(204).send();
};