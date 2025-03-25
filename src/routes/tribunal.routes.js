const express = require("express")
const {
  getTribunais,
  getTribunalById,
  createTribunal,
  updateTribunal,
  deleteTribunal,
  getIntegracaoNotificacao,
  updateIntegracaoNotificacao,
  getIntegracaoConsulta,
  updateIntegracaoConsulta,
} = require("../controllers/tribunal.controller")
const { authenticate } = require("../middlewares/authenticate")
const { authorize } = require("../middlewares/authorize")
const { validate } = require("../middlewares/validate")
const {
  createTribunalSchema,
  updateTribunalSchema,
  updateIntegracaoNotificacaoSchema,
  updateIntegracaoConsultaSchema,
} = require("../validations/tribunal.validation")

const router = express.Router()

// Todas as rotas requerem autenticação
router.use(authenticate)

// Rotas de tribunais
router.get("/", getTribunais)
router.get("/:id", getTribunalById)
router.post("/", authorize(["administrador_nacional"]), validate(createTribunalSchema), createTribunal)
router.put("/:id", authorize(["administrador_nacional"]), validate(updateTribunalSchema), updateTribunal)
router.delete("/:id", authorize(["administrador_nacional"]), deleteTribunal)

// Rotas de integrações
router.get("/:tribunalId/integracao-notificacao", getIntegracaoNotificacao)
router.put(
  "/:tribunalId/integracao-notificacao",
  authorize(["administrador_nacional"]),
  validate(updateIntegracaoNotificacaoSchema),
  updateIntegracaoNotificacao,
)
router.get("/:tribunalId/integracao-consulta", getIntegracaoConsulta)
router.put(
  "/:tribunalId/integracao-consulta",
  authorize(["administrador_nacional"]),
  validate(updateIntegracaoConsultaSchema),
  updateIntegracaoConsulta,
)

module.exports = router

