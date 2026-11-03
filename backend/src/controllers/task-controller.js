const taskService = require('../services/task-service');

async function list(req, res) {
  res.json(await taskService.list(req.user.id));
}

async function create(req, res) {
  res.status(201).json(await taskService.create(req.body, req.user.id));
}

async function update(req, res) {
  res.json(await taskService.update(req.params.id, req.body, req.user.id));
}

async function remove(req, res) {
  await taskService.remove(req.params.id, req.user.id);
  res.status(204).send();
}

module.exports = { list, create, update, remove };
