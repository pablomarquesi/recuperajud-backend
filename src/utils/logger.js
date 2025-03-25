const winston = require("winston")
const path = require("path")
const fs = require("fs")

// Criar diretório de logs se não existir
const logDir = "logs"
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

// Configurar o logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  defaultMeta: { service: "recuperajud-api" },
  transports: [
    // Escrever logs de erro em arquivo
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
    // Escrever todos os logs em arquivo
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
  ],
})

// Adicionar console transport em ambiente de desenvolvimento
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  )
}

module.exports = { logger }

