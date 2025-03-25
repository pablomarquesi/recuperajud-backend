require("dotenv").config()
require("express-async-errors")
const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const { errorHandler } = require("./middlewares/errorHandler")
const { logger } = require("./utils/logger")
const routes = require("./routes")

// Inicializa o app Express
const app = express()

// Middlewares
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }))

// Rotas
app.use("/api", routes)

// Rota de verificação de saúde
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() })
})

// Middleware de tratamento de erros
app.use(errorHandler)

// Inicializa o servidor
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT} em ambiente ${process.env.NODE_ENV}`)
})

// Tratamento de exceções não capturadas
process.on("uncaughtException", (error) => {
  logger.error("Exceção não capturada:", error)
  process.exit(1)
})

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Rejeição não tratada em:", promise, "razão:", reason)
  process.exit(1)
})

module.exports = app

