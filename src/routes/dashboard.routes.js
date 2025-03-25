const express = require("express")
const {
  getStats,
  getProcessosPorStatus,
  getProcessosPorTribunal,
  getProcessosPorSetor,
  getAtividadesRecentes,
} = require("../controllers/dashboard.controller")
const { authenticate } = require("../middlewares/authenticate")

const router = express.Router()

// Todas as rotas requerem autenticação
router.use(authenticate)

router.get("/stats", getStats)
router.get("/processos-por-status", getProcessosPorStatus)
router.get("/processos-por-tribunal", getProcessosPorTribunal)
router.get("/processos-por-setor", getProcessosPorSetor)
router.get("/atividades-recentes", getAtividadesRecentes)

module.exports = router

