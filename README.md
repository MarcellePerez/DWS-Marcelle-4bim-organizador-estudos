# Foco — Organizador de estudos

Aplicação full-stack para organizar tarefas de estudo por disciplina, prazo, prioridade e situação. O projeto atende à AV1 com uma API completa e à AV2 com uma interface React integrada à API.

## Tecnologias

- Backend: Node.js, Express 5, arquitetura MVC, Prisma ORM 7.10 e MySQL/MariaDB.
- Autenticação: JWT e senhas protegidas com bcrypt.
- Frontend: React 19, Vite e Tailwind CSS 4.3.

## Regra de negócio

Uma tarefa principal não pode ser concluída enquanto tiver subtarefas pendentes. A regra é verificada no backend, portanto não depende apenas da interface.

## Executar o backend

1. Instale MySQL/MariaDB e crie o banco `organizador_db`.
2. Entre em `backend` e ajuste o arquivo `.env` (não publique esse arquivo):

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/organizador_db"
JWT_SECRET="uma-chave-forte-e-secreta"
PORT=3000
```

3. Execute:

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run dev
```

Principais rotas: `POST /api/auth/register`, `POST /api/auth/login`, `GET/POST /api/tasks`, `PATCH/DELETE /api/tasks/:id` e `GET /api/health`.

## Executar o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Se a API estiver em outro endereço, crie `frontend/.env` com `VITE_API_URL`.
