const Joi = require("joi")

// Esquema de validação para login
exports.loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email inválido",
    "string.empty": "Email é obrigatório",
    "any.required": "Email é obrigatório",
  }),
  senha: Joi.string().required().messages({
    "string.empty": "Senha é obrigatória",
    "any.required": "Senha é obrigatória",
  }),
})

// Esquema de validação para refresh token
exports.refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "string.empty": "Refresh token é obrigatório",
    "any.required": "Refresh token é obrigatório",
  }),
})

// Esquema de validação para recuperação de senha
exports.forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email inválido",
    "string.empty": "Email é obrigatório",
    "any.required": "Email é obrigatório",
  }),
})

// Esquema de validação para redefinição de senha
exports.resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    "string.empty": "Token é obrigatório",
    "any.required": "Token é obrigatório",
  }),
  senha: Joi.string().min(6).required().messages({
    "string.min": "A senha deve ter pelo menos 6 caracteres",
    "string.empty": "Senha é obrigatória",
    "any.required": "Senha é obrigatória",
  }),
  confirmarSenha: Joi.string().valid(Joi.ref("senha")).required().messages({
    "any.only": "As senhas não coincidem",
    "string.empty": "Confirmação de senha é obrigatória",
    "any.required": "Confirmação de senha é obrigatória",
  }),
})

