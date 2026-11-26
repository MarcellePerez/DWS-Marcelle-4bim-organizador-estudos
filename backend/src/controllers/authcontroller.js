const authService = require('../services/auth-service');

exports.register = async (req, res) => {
  const result = await authService.register(req.body || {});
  return res.status(201).json(result);
};

exports.login = async (req, res) => {
  const result = await authService.login(req.body || {});
  return res.json(result);
};