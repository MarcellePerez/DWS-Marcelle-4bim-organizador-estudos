require('dotenv/config');
const express = require('express');
const authRoutes = require('./routes/auth-routes');
const taskRoutes = require('./routes/task-routes');
const errorHandler = require('./middleware/error-handler');

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET precisa ser configurado no ambiente.');
}

const app = express();
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use((_req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));
app.use(errorHandler);

const port = Number(process.env.PORT || 3000);
if (require.main === module) {
  app.listen(port, () => console.log(`API executando na porta ${port}`));
}

module.exports = app;
