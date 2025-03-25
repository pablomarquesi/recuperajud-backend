const multer = require("multer")
const path = require("path")
const fs = require("fs")
const { AppError } = require("../utils/appError")

// Configurar o diretório de upload
const uploadDir = process.env.UPLOAD_DIR || "uploads"
const maxFileSize = Number.parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB padrão

// Criar o diretório se não existir
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configurar o armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Criar subdiretório para o tipo de documento
    const subDir = path.join(uploadDir, req.body.tipoDocumento || "outros")
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true })
    }
    cb(null, subDir)
  },
  filename: (req, file, cb) => {
    // Gerar nome de arquivo único
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, `${uniqueSuffix}${ext}`)
  },
})

// Filtrar arquivos por tipo
const fileFilter = (req, file, cb) => {
  // Lista de tipos MIME permitidos
  const allowedMimes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
    "text/plain",
  ]

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new AppError("Tipo de arquivo não permitido", 400), false)
  }
}

// Configurar o middleware de upload
exports.uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize,
  },
})

