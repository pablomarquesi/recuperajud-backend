const express = require("express")
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/user.controller")
const { authenticate } = require("../middlewares/authenticate")
const { authorize } = require("../middlewares/authorize")
const { validate } = require("../middlewares/validate")
const {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  updateProfileSchema,
} = require("../validations/user.validation")

const router = express.Router()

// Todas as rotas requerem autenticação
router.use(authenticate)

// Rotas para o perfil do usuário atual
router.get("/profile", getUserProfile)
router.put("/profile", validate(updateProfileSchema), updateUserProfile)
router.put("/change-password", validate(changePasswordSchema), changePassword)

// Rotas que requerem permissões de administrador
router.get("/", authorize(["administrador_nacional", "administrador_regional"]), getUsers)
router.get("/:id", authorize(["administrador_nacional", "administrador_regional"]), getUserById)
router.post(
  "/",
  authorize(["administrador_nacional", "administrador_regional"]),
  validate(createUserSchema),
  createUser,
)
router.put(
  "/:id",
  authorize(["administrador_nacional", "administrador_regional"]),
  validate(updateUserSchema),
  updateUser,
)
router.delete("/:id", authorize(["administrador_nacional"]), deleteUser)

module.exports = router

