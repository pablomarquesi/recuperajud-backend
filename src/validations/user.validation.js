const Joi = require("joi")

// Esquema de validação para criação de usuário
exports.createUserSchema = Joi.object({
  nome: Joi.string().min(3).required().messages({
    "string.min": "O nome deve ter pelo menos 3 caracteres",
    "string.empty": "Nome é obrigatório",
    "any.required": "Nome é obrigatório",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email inválido",
    "string.empty": "Email é obrigatório",
    "any.required": "Email é obrigatório",
  }),
  senha: Joi.string().min(6).required().messages({
    "string.min": "A senha deve ter pelo menos 6 caracteres",
    "string.empty": "Senha é obrigatória",
    "any.required": "Senha é obrigatória",
  }),
  cargo: Joi.string().valid("magistrado", "servidor").required().messages({
    "any.only": "Cargo inválido",
    "string.empty": "Cargo é obrigatório",
    "any.required": "Cargo é obrigatório",
  }),
  permissao: Joi.string().valid("administrador_nacional", "administrador_regional", "operador").required().messages({
    "any.only": "Permissão inválida",
    "string.empty": "Permissão é obrigatória",
    "any.required": "Permissão é obrigatória",
  }),
  tribunalId: Joi.number()
    .integer()
    .when("permissao", {
      is: "operador",
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "number.base": "Tribunal inválido",
      "any.required": "Tribunal é obrigatório para operadores",
    }),
  regiaoId: Joi.number()
    .integer()
    .when("permissao", {
      is: "administrador_regional",
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "number.base": "Região inválida",
      "any.required": "Região é obrigatória para administradores regionais",
    }),
  status: Joi.string().valid("ativo", "inativo").default("ativo").messages({
    "any.only": "Status inválido",
  }),
})

// Esquema de validação para atualização de usuário
exports.updateUserSchema = Joi.object({
  nome: Joi.string().min(3).messages({
    "string.min": "O nome deve ter pelo menos 3 caracteres",
    "string.empty": "Nome é obrigatório",
  }),
  email: Joi.string().email().messages({
    "string.email": "Email inválido",
    "string.empty": "Email é obrigatório",
  }),
  cargo: Joi.string().valid("magistrado", "servidor").messages({
    "any.only": "Cargo inválido",
    "string.empty": "Cargo é obrigatório",
  }),
  permissao: Joi.string().valid("administrador_nacional", "administrador_regional", "operador").messages({
    "any.only": "Permissão inválida",
    "string.empty": "Permissão é obrigatória",
  }),
  tribunalId: Joi.number().integer().allow(null).messages({
    "number.base": "Tribunal inválido",
  }),
  regiaoId: Joi.number().integer().allow(null).messages({
    "number.base": "Região inválida",
  }),
  status: Joi.string().valid("ativo", "inativo").messages({
    "any.only": "Status inválido",
  }),
}).min(1)

// Esquema de validação para alteração de senha
exports.changePasswordSchema = Joi.object({
  senhaAtual: Joi.string().required().messages({
    "string.empty": "Senha atual é obrigatória",
    "any.required": "Senha atual é obrigatória",
  }),
  novaSenha: Joi.string().min(6).required().messages({
    "string.min": "A nova senha deve ter pelo menos 6 caracteres",
    "string.empty": "Nova senha é obrigatória",
    "any.required": "Nova senha é obrigatória",
  }),
  confirmarSenha: Joi.string().valid(Joi.ref("novaSenha")).required().messages({
    "any.only": "As senhas não coincidem",
    "string.empty": "Confirmação de senha é obrigatória",
    "any.required": "Confirmação de senha é obrigatória",
  }),
})

// Esquema de validação para atualização de perfil
exports.updateProfileSchema = Joi.object({
  nome: Joi.string().min(3).required().messages({
    "string.min": "O nome deve ter pelo menos 3 caracteres",
    "string.empty": "Nome é obrigatório",
    "any.required": "Nome é obrigatório",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email inválido",
    "string.empty": "Email é obrigatório",
    "any.required": "Email é obrigatório",
  }),
})

