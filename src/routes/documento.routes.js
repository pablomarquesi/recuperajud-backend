const express = require("express")
const {
  getDocumentos,
  getDocumentoById,
  uploadDocumento,
  updateDocumento,
  deleteDocumento,
  downloadDocumento,
} = require("../controllers/documento.controller")
const { authenticate } = require("../middlewares/authenticate")
const { uploadMiddleware } = require("../middlewares/upload")
const { validate } = require("../middlewares/validate")
const { createDocumentoSchema, updateDocumentoSchema } = require("../validations/documento.validation")

const router = express.Router()

// Todas as rotas requerem autenticação
router.use(authenticate)

router.get("/", getDocumentos)
router.get("/:id", getDocumentoById)
router.get("/:id/download", downloadDocumento)
router.post("/", uploadMiddleware.single("arquivo"), validate(createDocumentoSchema), uploadDocumento)
router.put("/:id", validate(updateDocumentoSchema), updateDocumento)
router.delete("/:id", deleteDocumento)

module.exports = router

