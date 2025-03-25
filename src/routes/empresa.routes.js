const express = require("express")
const {
  getEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
  getSociosByEmpresaId,
  createSocio,
  updateSocio,
  deleteSocio,
} = require("../controllers/empresa.controller")
const { authenticate } = require("../middlewares/authenticate")
const { authorize } = require("../middlewares/authorize")
const { validate } = require("../middlewares/validate")
const {
  createEmpresaSchema,
  updateEmpresaSchema,
  createSocioSchema,
  updateSocioSchema,
} = require("../validations/empresa.validation")

const router = express.Router()

// Todas as rotas requerem autenticação
router.use(authenticate)

// Rotas de empresas
router.get("/", getEmpresas)
router.get("/:id", getEmpresaById)
router.post("/", validate(createEmpresaSchema), createEmpresa)
router.put("/:id", validate(updateEmpresaSchema), updateEmpresa)
router.delete("/:id", authorize(["administrador_nacional", "administrador_regional"]), deleteEmpresa)

// Rotas de sócios
router.get("/:empresaId/socios", getSociosByEmpresaId)
router.post("/:empresaId/socios", validate(createSocioSchema), createSocio)
router.put("/:empresaId/socios/:socioId", validate(updateSocioSchema), updateSocio)
router.delete("/:empresaId/socios/:socioId", deleteSocio)

module.exports = router

