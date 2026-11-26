require('dotenv').config();
const express = require('express');
const cors = require('cors');

const requiredEnvironment = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvironment = requiredEnvironment.filter((key) => !process.env[key]?.trim());

if (missingEnvironment.length > 0) {
  throw new Error(`Variáveis de ambiente obrigatórias ausentes: ${missingEnvironment.join(', ')}`);
}

const errorHandler = require('./middleware/error-handler');
const authRoutes = require('./routes/authroutes');
const taskRoutes = require('./routes/taskroutes');

const app = express();

app.use(express.json());

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origem não autorizada pelo CORS.'));
  },
}));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});