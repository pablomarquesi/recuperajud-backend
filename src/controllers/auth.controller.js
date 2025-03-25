const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const { prisma } = require("../utils/prisma")
const { AppError } = require("../utils/appError")
const { generateTokenPair, verifyToken } = require("../utils/jwt")
const { sendEmail } = require("../utils/email")

/**
 * Login de usuário
 */
exports.login = async (req, res) => {
  const { email, senha } = req.body

  // Buscar usuário pelo email
  const user = await prisma.usuario.findUnique({
    where: { email },
  })

  // Verificar se o usuário existe e a senha está correta
  if (!user || !(await bcrypt.compare(senha, user.senhaHash))) {
    throw new AppError("Email ou senha incorretos", 401)
  }

  // Verificar se o usuário está ativo
  if (user.status !== "ativo") {
    throw new AppError("Usuário inativo. Entre em contato com o administrador.", 403)
  }

  // Gerar tokens
  const { accessToken, refreshToken } = generateTokenPair(user)

  // Registrar o login nos logs
  await prisma.logAtividade.create({
    data: {
      usuarioId: user.id,
      acao: "login",
      entidade: "usuario",
      entidadeId: user.id,
      descricao: "Login no sistema",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    },
  })

  // Atualizar o último acesso do usuário
  await prisma.usuario.update({
    where: { id: user.id },
    data: { ultimoAcesso: new Date() },
  })

  // Retornar os tokens e informações básicas do usuário
  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
        permissao: user.permissao,
      },
      accessToken,
      refreshToken,
    },
  })
}

/**
 * Atualização de token de acesso usando refresh token
 */
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body

  try {
    // Verificar o refresh token
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET)

    // Buscar o usuário
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.id },
    })

    if (!user || user.status !== "ativo") {
      throw new AppError("Token inválido ou usuário inativo", 401)
    }

    // Gerar novo par de tokens
    const tokens = generateTokenPair(user)

    res.status(200).json({
      status: "success",
      data: tokens,
    })
  } catch (error) {
    throw new AppError("Token inválido ou expirado", 401)
  }
}

/**
 * Solicitação de recuperação de senha
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body

  // Buscar usuário pelo email
  const user = await prisma.usuario.findUnique({
    where: { email },
  })

  // Se o usuário não existir, retornar sucesso mesmo assim (por segurança)
  if (!user) {
    return res.status(200).json({
      status: "success",
      message: "Se o email estiver cadastrado, você receberá um link para redefinir sua senha.",
    })
  }

  // Gerar token de redefinição de senha
  const resetToken = crypto.randomBytes(32).toString("hex")
  const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex")

  // Salvar o token no banco de dados
  await prisma.usuario.update({
    where: { id: user.id },
    data: {
      tokenResetSenha: tokenHash,
      expiracaoToken: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hora
    },
  })

  // Enviar email com o link de redefinição
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

  try {
    await sendEmail({
      to: user.email,
      subject: "RecuperaJud - Redefinição de Senha",
      text: `Você solicitou a redefinição de sua senha. Acesse o link a seguir para criar uma nova senha: ${resetUrl}. O link é válido por 1 hora.`,
      html: `
        <p>Olá ${user.nome},</p>
        <p>Você solicitou a redefinição de sua senha.</p>
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4A6FDC; color: white; text-decoration: none; border-radius: 5px;">Redefinir Senha</a>
        <p>O link é válido por 1 hora.</p>
        <p>Se você não solicitou esta redefinição, ignore este email.</p>
        <p>Atenciosamente,<br>Equipe RecuperaJud</p>
      `,
    })

    res.status(200).json({
      status: "success",
      message: "Link de redefinição de senha enviado para o seu email.",
    })
  } catch (error) {
    // Em caso de erro, remover o token do banco de dados
    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        tokenResetSenha: null,
        expiracaoToken: null,
      },
    })

    throw new AppError("Erro ao enviar email de redefinição de senha. Tente novamente mais tarde.", 500)
  }
}

/**
 * Redefinição de senha
 */
exports.resetPassword = async (req, res) => {
  const { token, senha } = req.body

  // Calcular o hash do token
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

  // Buscar usuário com o token válido
  const user = await prisma.usuario.findFirst({
    where: {
      tokenResetSenha: tokenHash,
      expiracaoToken: {
        gt: new Date(),
      },
    },
  })

  if (!user) {
    throw new AppError("Token inválido ou expirado", 400)
  }

  // Gerar hash da nova senha
  const senhaHash = await bcrypt.hash(senha, 12)

  // Atualizar a senha e remover o token
  await prisma.usuario.update({
    where: { id: user.id },
    data: {
      senhaHash,
      tokenResetSenha: null,
      expiracaoToken: null,
    },
  })

  // Registrar a alteração nos logs
  await prisma.logAtividade.create({
    data: {
      usuarioId: user.id,
      acao: "redefinir_senha",
      entidade: "usuario",
      entidadeId: user.id,
      descricao: "Redefinição de senha",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    },
  })

  res.status(200).json({
    status: "success",
    message: "Senha redefinida com sucesso.",
  })
}

/**
 * Validação de token
 */
exports.validateToken = async (req, res) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Token não fornecido", 401)
  }

  const token = authHeader.split(" ")[1]

  try {
    // Verificar o token
    const decoded = verifyToken(token, process.env.JWT_SECRET)

    // Buscar o usuário
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        permissao: true,
        status: true,
      },
    })

    if (!user || user.status !== "ativo") {
      throw new AppError("Usuário não encontrado ou inativo", 401)
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    })
  } catch (error) {
    throw new AppError("Token inválido ou expirado", 401)
  }
}

