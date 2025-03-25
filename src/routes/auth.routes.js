const express = require("express")
const { login, refreshToken, forgotPassword, resetPassword, validateToken } = require("../controllers/auth.controller")
const { validate } = require("../middlewares/validate")
const {
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validations/auth.validation")

const router = express.Router()

router.post("/login", validate(loginSchema), login)
router.post("/refresh-token", validate(refreshTokenSchema), refreshToken)
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword)
router.post("/reset-password", validate(resetPasswordSchema), resetPassword)
router.get("/validate-token", validateToken)

module.exports = router

