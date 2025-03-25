const jwt = require("jsonwebtoken")

/**
 * Gera um token JWT
 * @param {Object} payload - Dados a serem incluídos no token
 * @param {string} secret - Chave secreta para assinar o token
 * @param {string|number} expiresIn - Tempo de expiração do token
 * @returns {string} Token JWT
 */
exports.generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn })
}

/**
 * Verifica e decodifica um token JWT
 * @param {string} token - Token JWT a ser verificado
 * @param {string} secret - Chave secreta para verificar o token
 * @returns {Object} Payload decodificado
 */
exports.verifyToken = (token, secret) => {
  return jwt.verify(token, secret)
}

/**
 * Gera um par de tokens (acesso e atualização)
 * @param {Object} user - Dados do usuário
 * @returns {Object} Objeto contendo os tokens de acesso e atualização
 */
exports.generateTokenPair = (user) => {
  const accessToken = this.generateToken(
    { id: user.id, email: user.email, permissao: user.permissao },
    process.env.JWT_SECRET,
    process.env.JWT_EXPIRES_IN,
  )

  const refreshToken = this.generateToken(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_REFRESH_EXPIRES_IN,
  )

  return { accessToken, refreshToken }
}

