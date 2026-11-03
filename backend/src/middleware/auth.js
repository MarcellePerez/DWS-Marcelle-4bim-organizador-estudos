const jwt = require('jsonwebtoken');
const HttpError = require('../utils/http-error');

function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new HttpError(401, 'Token de autenticação não informado.'));
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return next(new HttpError(401, 'Sessão inválida ou expirada.'));
  }
}

module.exports = authenticate;
