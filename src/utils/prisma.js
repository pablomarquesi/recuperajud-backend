const { PrismaClient } = require("@prisma/client")

// Criar uma instância do Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
})

// Middleware para registrar o usuário atual nas operações
prisma.$use(async (params, next) => {
  // Obter o usuário atual do contexto (se disponível)
  const currentUser = global.currentUser

  // Adicionar o usuário atual aos campos de auditoria
  if (params.action === "create" && currentUser) {
    if (params.args.data && !params.args.data.createdById) {
      params.args.data.createdById = currentUser.id
    }
  }

  if (params.action === "update" && currentUser) {
    if (params.args.data && !params.args.data.updatedById) {
      params.args.data.updatedById = currentUser.id
    }
  }

  return next(params)
})

module.exports = { prisma }

