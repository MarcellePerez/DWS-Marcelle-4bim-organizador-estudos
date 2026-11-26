const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const HttpError = require('../utils/http-error');

function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '2h',
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function register({ name, email, password } = {}) {
  if (
    typeof name !== 'string'
    || !name.trim()
    || name.trim().length > 191
    || typeof email !== 'string'
    || !isValidEmail(email.trim())
    || email.trim().length > 191
    || typeof password !== 'string'
    || password.length < 6
  ) {
    throw new HttpError(400, 'Nome, e-mail e senha com pelo menos 6 caracteres são obrigatórios.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    throw new HttpError(409, 'Já existe uma conta com este e-mail.');
  }

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
    },
    select: { id: true, name: true, email: true },
  });

  return { user, token: createToken(user) };
}

async function login({ email, password } = {}) {
  if (
    typeof email !== 'string'
    || !isValidEmail(email.trim())
    || typeof password !== 'string'
    || !password
  ) {
    throw new HttpError(400, 'Informe um e-mail válido e a senha.');
  }

  const user = await prisma.user.findUnique({ where: { email: email?.trim().toLowerCase() } });
  const validPassword = user && await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new HttpError(401, 'E-mail ou senha inválidos.');
  }

  const safeUser = { id: user.id, name: user.name, email: user.email };
  return { user: safeUser, token: createToken(safeUser) };
}

module.exports = { register, login };
