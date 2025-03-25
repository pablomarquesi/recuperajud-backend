const bcrypt = require("bcryptjs")
const { prisma } = require("../utils/prisma")
const { AppError } = require("../utils/appError")

/**
 * Obtém todos os usuários
 */
exports.getUsers = async (req, res) => {
  const { search, permissao, status, tribunal, regiao, page = 1, limit = 10 } = req.query

  // Construir filtros
  const where = {}

  if (search) {
    where.OR = [
      { nome: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ]
  }

  if (permissao) {
    where.permissao = permissao
  }

  if (status) {
    where.status = status
  }

  if (tribunal) {
    where.tribunalId = Number.parseInt(tribunal)
  }

  if (regiao) {
    where.regiaoId = Number.parseInt(regiao)
  }

  // Restrições baseadas na permissão do usuário
  if (req.user.permissao === "administrador_regional") {
    where.regiaoId = req.user.regiaoId
  }

  // Calcular paginação
  const skip = (page - 1) * limit

  // Buscar usuários
  const [users, total] = await Promise.all([
    prisma.usuario.findMany({
      where,
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        permissao: true,
        status: true,
        ultimoAcesso: true,
        tribunal: {
          select: {
            id: true,
            nome: true,
            sigla: true,
          },
        },
        regiao: {
          select: {
            id: true,
            nome: true,
            sigla: true,
          },
        },
        createdAt: true,
      },
      orderBy: { nome: "asc" },
      skip,
      take: Number.parseInt(limit),
    }),
    prisma.usuario.count({ where }),
  ])

  // Calcular informações de paginação
  const totalPages = Math.ceil(total / limit)

  res.status(200).json({
    status: "success",
    results: users.length,
    pagination: {
      total,
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      totalPages,
    },
    data: { users },
  })
}

/**
 * Obtém um usuário pelo ID
 */
exports.getUserById = async (req, res) => {
  const { id } = req.params

  // Verificar restrições baseadas na permissão do usuário
  if (req.user.permissao === "administrador_regional") {
    const user = await prisma.usuario.findUnique({
      where: { id: Number.parseInt(id) },
      select: { regiaoId: true },
    })

    if (!user || user.regiaoId !== req.user.regiaoId) {
      throw new AppError("Você não tem permissão para acessar este usuário", 403)
    }
  }

  // Buscar usuário
  const user = await prisma.usuario.findUnique({
    where: { id: Number.parseInt(id) },
    select: {
      id: true,
      nome: true,
      email: true,
      cargo: true,
      permissao: true,
      status: true,
      ultimoAcesso: true,
      tribunal: {
        select: {
          id: true,
          nome: true,
          sigla: true,
        },
      },
      regiao: {
        select: {
          id: true,
          nome: true,
          sigla: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!user) {
    throw new AppError("Usuário não encontrado", 404)
  }

  res.status(200).json({
    status: "success",
    data: { user },
  })
}

/**
 * Cria um novo usuário
 */
exports.createUser = async (req, res) => {
  const { nome, email, senha, cargo, permissao, tribunalId, regiaoId, status } = req.body

  // Verificar se o email já está em uso
  const existingUser = await prisma.usuario.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new AppError("Email já está em uso", 409)
  }

  // Verificar restrições baseadas na permissão do usuário
  if (req.user.permissao === "administrador_regional") {
    // Administradores regionais só podem criar usuários na sua região
    if (regiaoId !== req.user.regiaoId) {
      throw new AppError("Você só pode criar usuários na sua região", 403)
    }

    // Administradores regionais não podem criar administradores nacionais
    if (permissao === "administrador_nacional") {
      throw new AppError("Você não tem permissão para criar administradores nacionais", 403)
    }
  }

  // Gerar hash da senha
  const senhaHash = await bcrypt.hash(senha, 12)

  // Criar usuário
  const user = await prisma.usuario.create({
    data: {
      nome,
      email,
      senhaHash,
      cargo,
      permissao,
      tribunalId: tribunalId ? Number.parseInt(tribunalId) : null,
      regiaoId: regiaoId ? Number.parseInt(regiaoId) : null,
      status: status || "ativo",
    },
    select: {
      id: true,
      nome: true,
      email: true,
      cargo: true,
      permissao: true,
      status: true,
      tribunal: {
        select: {
          id: true,
          nome: true,
          sigla: true,
        },
      },
      regiao: {
        select: {
          id: true,
          nome: true,
          sigla: true,
        },
      },
      createdAt: true,
    },
  })

  // Registrar a criação nos logs
  await prisma.logAtividade.create({
    data: {
      usuarioId: req.user.id,
      acao: "criar",
      entidade: "usuario",
      entidadeId: user.id,
      descricao: `Criação do usuário ${user.nome}`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    },
  })

  res.status(201).json({
    status: "success",
    data: { user },
  })
}

/**
 * Atualiza um usuário
 */
exports.updateUser = async (req, res) => {
  const { id } = req.params
  const { nome, email, cargo, permissao, tribunalId, regiaoId, status } = req.body

  // Verificar se o usuário existe
  const existingUser = await prisma.usuario.findUnique({
    where: { id: Number.parseInt(id) },
  })

  if (!existingUser) {
    throw new AppError("Usuário não encontrado", 404)
  }

  // Verificar restrições baseadas na permissão do usuário
  if (req.user.permissao === "administrador_regional") {
    // Administradores regionais só podem atualizar usuários na sua região
    if (existingUser.regiaoId !== req.user.regiaoId) {
      throw new AppError("Você só pode atualizar usuários na sua região", 403)
    }

    // Administradores regionais não podem alterar a região do usuário
    if (regiaoId && Number.parseInt(regiaoId) !== req.user.regiaoId) {
      throw new AppError("Você não pode alterar a região do usuário", 403)
    }

    // Administradores regionais não podem promover usuários a administradores nacionais
    if (permissao === "administrador_nacional") {
      throw new AppError("Você não tem permissão para criar administradores nacionais", 403)
    }
  }

  // Verificar se o email já está em uso por outro usuário
  if (email && email !== existingUser.email) {
    const emailInUse = await prisma.usuario.findUnique({
      where: { email },
    })

    if (emailInUse) {
      throw new AppError("Email já está em uso", 409)
    }
  }

  // Atualizar usuário
  const user = await prisma.usuario.update({
    where: { id: Number.parseInt(id) },
    data: {
      nome,
      email,
      cargo,
      permissao,
      tribunalId: tribunalId ? Number.parseInt(tribunalId) : null,
      regiaoId: regiaoId ? Number.parseInt(regiaoId) : null,
      status,
    },
    select: {
      id: true,
      nome: true,
      email: true,
      cargo: true,
      permissao: true,
      status: true,
      tribunal: {
        select: {
          id: true,
          nome: true,
          sigla: true,
        },
      },
      regiao: {
        select: {
          id: true,
          nome: true,
          sigla: true,
        },
      },
      updatedAt: true,
    },
  })

  // Registrar a atualização nos logs
  await prisma.logAtividade.create({
    data: {
      usuarioId: req.user.id,
      acao: "atualizar",
      entidade: "usuario",
      entidadeId: user.id,
      descricao: `Atualização do usuário ${user.nome}`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    },
  })

  res.status(200).json({
    status: "success",
    data: { user },
  })
}

/**
 * Exclui um usuário
 */
exports.deleteUser = async (req, res) => {
  const { id } = req.params

  // Verificar se o usuário existe
  const user = await prisma.usuario.findUnique({
    where: { id: Number.parseInt(id) },
  })

  if (!user) {
    throw new AppError("Usuário não encontrado", 404)
  }

  // Não permitir excluir o próprio usuário
  if (user.id === req.user.id) {
    throw new AppError("Você não pode excluir seu próprio usuário", 403)
  }

  // Excluir usuário
  await prisma.usuario.delete({
    where: { id: Number.parseInt(id) },
  })

  // Registrar a exclusão nos logs
  await prisma.logAtividade.create({
    data: {
      usuarioId: req.user.id,
      acao: "excluir",
      entidade: "usuario",
      entidadeId: Number.parseInt(id),
      descricao: `Exclusão do usuário ${user.nome}`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    },
  })

  res.status(204).send()
}

/**
 * Altera a senha do usuário
 */
exports.changePassword = async (req, res) => {
  const { senhaAtual, novaSenha } = req.body

  // Buscar usuário
  const user = await prisma.usuario.findUnique({
    where: { id: req.user.id },
  })

  // Verificar se a senha atual está correta
  const senhaCorreta = await bcrypt.compare(senhaAtual, user.senhaHash)

  if (!senhaCorreta) {
    throw new AppError("Senha atual incorreta", 401)
  }

  // Gerar hash da nova senha
  const senhaHash = await bcrypt.hash(novaSenha, 12)

  // Atualizar senha
  await prisma.usuario.update({
    where: { id: req.user.id },
    data: { senhaHash },
  })

  // Registrar a alteração nos logs
  await prisma.logAtividade.create({
    data: {
      usuarioId: req.user.id,
      acao: "alterar_senha",
      entidade: "usuario",
      entidadeId: req.user.id,
      descricao: "Alteração de senha",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    },
  })

  res.status(200).json({
    status: "success",
    message: "Senha alterada com sucesso",
  })
}

/**
 * Obtém o perfil do usuário atual
 */
exports.getUserProfile = async (req, res) => {
  const user = await prisma.usuario.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      nome: true,
      email: true,
      cargo: true,
      permissao: true,
      status: true,
      ultimoAcesso: true,
      tribunal: {
        select: {
          id: true,
          nome: true,
          sigla: true,
        },
      },
      regiao: {
        select: {
          id: true,
          nome: true,
          sigla: true,
        },
      },
    },
  })

  res.status(200).json({
    status: "success",
    data: { user },
  })
}

/**
 * Atualiza o perfil do usuário atual
 */
exports.updateUserProfile = async (req, res) => {
  const { nome, email } = req.body

  // Verificar se o email já está em uso por outro usuário
  if (email && email !== req.user.email) {
    const emailInUse = await prisma.usuario.findUnique({
      where: { email },
    })

    if (emailInUse) {
      throw new AppError("Email já está em uso", 409)
    }
  }

  // Atualizar perfil
  const user = await prisma.usuario.update({
    where: { id: req.user.id },
    data: { nome, email },
    select: {
      id: true,
      nome: true,
      email: true,
      cargo: true,
      permissao: true,
      status: true,
      tribunal: {
        select: {
          id: true,
          nome: true,
          sigla: true,
        },
      },
      regiao: {
        select: {
          id: true,
          nome: true,
          sigla: true,
        },
      },
    },
  })

  // Registrar a atualização nos logs
  await prisma.logAtividade.create({
    data: {
      usuarioId: req.user.id,
      acao: "atualizar_perfil",
      entidade: "usuario",
      entidadeId: req.user.id,
      descricao: "Atualização de perfil",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    },
  })

  res.status(200).json({
    status: "success",
    data: { user },
  })
}

