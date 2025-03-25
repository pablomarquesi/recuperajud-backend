const jwt = require("jsonwebtoken")
const { prisma } = require("../utils/prisma")
const { AppError } = require("../utils/appError")

exports.authenticate = async (req, res, next) => {
  try {
    // Verificar se o token está presente
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Token de autenticação não fornecido", 401)
    }

    // Extrair o token
    const token = authHeader.split(" ")[1]

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Verificar se o usuário existe e está ativo
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        permissao: true,
        status: true,
        tribunalId: true,
        regiaoId: true,
      },
    })

    if (!user) {
      throw new AppError("Usuário não encontrado", 401)
    }

    if (user.status !== "ativo") {
      throw new AppError("Usuário inativo", 403)
    }

    // Adicionar o usuário ao objeto de requisição
    req.user = user

    // Atualizar o último acesso do usuário
    await prisma.usuario.update({
      where: { id: user.id },
      data: { ultimoAcesso: new Date() },
    })

    // Registrar o acesso nos logs
    await prisma.logAtividade.create({
      data: {
        usuarioId: user.id,
        acao: "acesso",
        entidade: "sistema",
        descricao: "Acesso ao sistema",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    })

    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new AppError("Token inválido ou expirado", 401))
    }
    next(error)
  }
}

