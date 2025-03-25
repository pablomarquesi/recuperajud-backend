const express = require("express")
const {
  getProcessos,
  getProcessoById,
  createProcesso,
  updateProcesso,
  deleteProcesso,
  getEtapasByProcessoId,
  createEtapa,
  updateEtapa,
  deleteEtapa,
} = require("../controllers/processo.controller")
const { authenticate } = require("../middlewares/authenticate")
const { authorize } = require("../middlewares/authorize")
const { validate } = require("../middlewares/validate")
const {
  createProcessoSchema,
  updateProcessoSchema,
  createEtapaSchema,
  updateEtapaSchema,
} = require("../validations/processo.validation")

const router = express.Router()

// Todas as rotas requerem autenticação
router.use(authenticate)

// Rotas de processos
router.get("/", getProcessos)
router.get("/:id", getProcessoById)
router.post("/", validate(createProcessoSchema), createProcesso)
router.put("/:id", validate(updateProcessoSchema), updateProcesso)
router.delete("/:id", authorize(["administrador_nacional", "administrador_regional"]), deleteProcesso)

// Rotas de etapas
router.get("/:processoId/etapas", getEtapasByProcessoId)
router.post("/:processoId/etapas", validate(createEtapaSchema), getEtapasByProcessoId)
router.post("/:processoId/etapas", validate(createEtapaSchema), createEtapa)
router.put("/:processoId/etapas/:etapaId", validate(updateEtapaSchema), updateEtapa)
router.delete("/:processoId/etapas/:etapaId", deleteEtapa)

module.exports = router

