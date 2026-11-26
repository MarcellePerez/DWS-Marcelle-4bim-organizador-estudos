# Foco — Organizador de estudos

Aplicação full-stack para organizar tarefas de estudo por disciplina, prazo, prioridade e situação. Cada usuário acessa e gerencia apenas as próprias tarefas.

## Tecnologias

- Backend: Node.js, Express 5 e arquitetura MVC.
- Banco relacional: PostgreSQL com Prisma ORM e Prisma Client 7.10.0.
- Autenticação: JWT e senhas com hash bcrypt.
- Frontend: React 19, Vite e Tailwind CSS 4.3.0.
- Ícones: lucide-react. Os componentes de interface foram desenvolvidos no projeto; não foram copiados de bibliotecas de componentes externas.

## Regra de negócio

Uma tarefa principal não pode ser concluída enquanto tiver subtarefas pendentes. A regra é verificada pela API e subtarefas só podem ser vinculadas a tarefas principais do mesmo usuário.

## Executar localmente

### Backend

Requisitos: Node.js e um banco PostgreSQL. O MariaDB usado anteriormente continua intacto, mas a aplicação atual passará a usar PostgreSQL; os dados locais não são copiados automaticamente.

1. Crie um banco PostgreSQL vazio chamado `organizador_db` (ou use a URL de um banco Render Postgres).
2. No PowerShell, copie o exemplo e edite as credenciais:

   ```powershell
   cd backend
   Copy-Item .env.example .env
   ```

3. Configure `DATABASE_URL`, `JWT_SECRET` e `FRONTEND_URL` no `backend/.env`. O formato local de `DATABASE_URL` é `postgresql://usuario:senha@localhost:5432/organizador_db?schema=public`. Use um segredo JWT forte e não publique esse arquivo.
4. Instale e inicialize o banco:

   ```bash
   npm ci
   npm run prisma:generate
   npm run prisma:migrate
   npm run dev
   ```

A API ficará disponível em `http://localhost:3000`. As migrations PostgreSQL ativas ficam em `prisma/migrations-postgresql`. `npm run prisma:migrate` aplica migrations em desenvolvimento; para implantação, use `npm run prisma:deploy`.

O histórico MariaDB anterior continua em `prisma/migrations` apenas para referência; não o aplique ao PostgreSQL. O PostgreSQL novo começa vazio, então crie novamente as contas de demonstração.

### Frontend

Em outro terminal:

```powershell
cd frontend
npm ci
Copy-Item .env.example .env.local
npm run dev
```

O exemplo configura `VITE_API_URL=http://localhost:3000`. A variável `VITE_API_URL` é pública e deve conter a URL base da API no ambiente publicado; não coloque segredos no frontend.

## Rotas principais

| Método | Rota | Acesso |
| --- | --- | --- |
| `GET` | `/health` | Público |
| `POST` | `/auth/register` | Público |
| `POST` | `/auth/login` | Público |
| `GET` | `/tasks` | JWT |
| `POST` | `/tasks` | JWT |
| `PUT` | `/tasks/:id` | JWT |
| `DELETE` | `/tasks/:id` | JWT; move para a lixeira |
| `DELETE` | `/tasks/:id?permanent=true` | JWT; exclui permanentemente |

As rotas JWT recebem `Authorization: Bearer <token>`. O `PUT` também permite restaurar uma tarefa enviando `deletedAt: null`.

## Publicação AV2

O repositório inclui `render.yaml` para criar o backend no Render. Crie também um banco Render Postgres e configure `DATABASE_URL` com a URL interna se o serviço e o banco estiverem na mesma região; se estiverem em regiões diferentes, use a URL externa. O comando de build do Render executa `npm run prisma:deploy` para aplicar as migrations ao PostgreSQL configurado. Configure `FRONTEND_URL` com a origem do frontend publicado; o Render gera `JWT_SECRET`.

Confira os limites do plano antes de criar o banco: a documentação do Render informa que bancos Postgres gratuitos expiram após 30 dias. Não use esse plano para guardar dados que precisem continuar disponíveis depois desse prazo sem fazer backup ou escolher um plano adequado. [Detalhes dos planos gratuitos do Render](https://render.com/docs/free).

Publique `frontend` na Vercel, definindo `frontend` como diretório raiz e `VITE_API_URL` como a URL pública do backend. O arquivo `frontend/vercel.json` habilita o fallback de rotas do React. Atualize `FRONTEND_URL` no Render após descobrir a origem pública do frontend.

**URL pública da aplicação:** preencher após a publicação.
