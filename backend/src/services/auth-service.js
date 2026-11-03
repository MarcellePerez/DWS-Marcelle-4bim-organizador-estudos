const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const HttpError = require('../utils/http-error');

function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '2h',
  });
}

async function register({ name, email, password }) {
  if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
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

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email: email?.trim().toLowerCase() } });
  const validPassword = user && await bcrypt.compare(password || '', user.password);
  if (!validPassword) {
    throw new HttpError(401, 'E-mail ou senha inválidos.');
  }

  const safeUser = { id: user.id, name: user.name, email: user.email };
  return { user: safeUser, token: createToken(safeUser) };
}

module.exports = { register, login };
