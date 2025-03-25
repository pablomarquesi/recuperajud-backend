const { logger } = require("../utils/logger")
const { AppError } = require("../utils/appError")

exports.errorHandler = (err, req, res, next) => {
  // Log do erro
  logger.error(err)

  // Verificar se é um erro da aplicação
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    })
  }

  // Erros do Prisma
  if (err.code) {
    // Erro de violação de chave única
    if (err.code === "P2002") {
      return res.status(409).json({
        status: "error",
        message: `Já existe um registro com este ${err.meta.target.join(", ")}`,
      })
    }

    // Erro de registro não encontrado
    if (err.code === "P2025") {
      return res.status(404).json({
        status: "error",
        message: "Registro não encontrado",
      })
    }
  }

  // Erro de validação do JWT
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "error",
      message: "Token inválido",
    })
  }

  // Erro de expiração do JWT
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "error",
      message: "Token expirado",
    })
  }

  // Erro de validação do Joi
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: err.message,
    })
  }

  // Erro de sintaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      status: "error",
      message: "JSON inválido",
    })
  }

  // Erro genérico
  const statusCode = err.statusCode || 500
  const message = err.message || "Erro interno do servidor"

  // Em ambiente de produção, não expor detalhes de erros internos
  if (process.env.NODE_ENV === "production" && statusCode === 500) {
    return res.status(500).json({
      status: "error",
      message: "Erro interno do servidor",
    })
  }

  return res.status(statusCode).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  })
}

