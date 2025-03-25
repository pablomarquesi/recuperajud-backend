const express = require("express")
const {
  getEmpresasPublicas,
  getEmpresaPublicaById,
  getProcessosPublicos,
  getProcessoPublicoById,
} = require("../controllers/public.controller")

const router = express.Router()

// Rotas públicas (não requerem autenticação)
router.get("/empresas", getEmpresasPublicas)
router.get("/empresas/:id", getEmpresaPublicaById)
router.get("/processos", getProcessosPublicos)
router.get("/processos/:id", getProcessoPublicoById)

module.exports = router

