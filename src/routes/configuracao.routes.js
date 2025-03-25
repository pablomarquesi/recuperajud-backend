const express = require("express")
const {
  getConfiguracoes,
  getConfiguracaoByChave,
  updateConfiguracao,
} = require("../controllers/configuracao.controller")
const { authenticate } = require("../middlewares/authenticate")
const { authorize } = require("../middlewares/authorize")
const { validate } = require("../middlewares/validate")
const { updateConfiguracaoSchema } = require("../validations/configuracao.validation")

const router = express.Router()

// Todas as rotas requerem autenticação
router.use(authenticate)

router.get("/", getConfiguracoes)
router.get("/:chave", getConfiguracaoByChave)
router.put("/:chave", authorize(["administrador_nacional"]), validate(updateConfiguracaoSchema), updateConfiguracao)

module.exports = router

