const express = require("express")
const authRoutes = require("./auth.routes")
const userRoutes = require("./user.routes")
const empresaRoutes = require("./empresa.routes")
const processoRoutes = require("./processo.routes")
const tribunalRoutes = require("./tribunal.routes")
const notificacaoRoutes = require("./notificacao.routes")
const documentoRoutes = require("./documento.routes")
const dashboardRoutes = require("./dashboard.routes")
const configuracaoRoutes = require("./configuracao.routes")
const publicRoutes = require("./public.routes")

const router = express.Router()

// Rotas públicas
router.use("/public", publicRoutes)

// Rotas de autenticação
router.use("/auth", authRoutes)

// Rotas protegidas
router.use("/users", userRoutes)
router.use("/empresas", empresaRoutes)
router.use("/processos", processoRoutes)
router.use("/tribunais", tribunalRoutes)
router.use("/notificacoes", notificacaoRoutes)
router.use("/documentos", documentoRoutes)
router.use("/dashboard", dashboardRoutes)
router.use("/configuracoes", configuracaoRoutes)

module.exports = router

