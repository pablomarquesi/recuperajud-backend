const express = require("express")
const {
  getNotificacoes,
  getNotificacaoById,
  markAsRead,
  markAllAsRead,
  deleteNotificacao,
} = require("../controllers/notificacao.controller")
const { authenticate } = require("../middlewares/authenticate")

const router = express.Router()

// Todas as rotas requerem autenticação
router.use(authenticate)

router.get("/", getNotificacoes)
router.get("/:id", getNotificacaoById)
router.put("/:id/read", markAsRead)
router.put("/read-all", markAllAsRead)
router.delete("/:id", deleteNotificacao)

module.exports = router

