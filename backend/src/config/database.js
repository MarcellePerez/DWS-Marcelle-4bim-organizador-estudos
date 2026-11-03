const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const mariadb = require('mariadb');

// Cria a pool de conexões com a URL do .env
const pool = mariadb.createPool(process.env.DATABASE_URL);

// Instancia o adapter correto e o PrismaClient
const adapter = new PrismaMariaDb(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;