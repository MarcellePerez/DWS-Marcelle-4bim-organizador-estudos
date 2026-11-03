require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authroutes');
const taskRoutes = require('./routes/taskroutes');

const app = express();

app.use(express.json());

// Permite conexões do frontend React
app.use(cors());

// Registro das Rotas da API
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando com sucesso na porta ${PORT}`);
});