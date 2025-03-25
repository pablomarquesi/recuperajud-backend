const { AppError } = require("../utils/appError")

exports.authorize = (permissoes = []) => {
  return (req, res, next) => {
    // Verificar se o usuário está autenticado
    if (!req.user) {
      return next(new AppError("Acesso não autorizado", 401))
    }

    // Se não houver permissões requeridas, permitir acesso
    if (permissoes.length === 0) {
      return next()
    }

    // Verificar se o usuário tem a permissão necessária
    if (!permissoes.includes(req.user.permissao)) {
      return next(new AppError("Você não tem permissão para acessar este recurso", 403))
    }

    // Verificar restrições específicas por tipo de permissão
    if (req.user.permissao === "administrador_regional" && req.params.regiaoId) {
      // Administradores regionais só podem acessar recursos da sua região
      if (req.user.regiaoId !== Number.parseInt(req.params.regiaoId)) {
        return next(new AppError("Você não tem permissão para acessar recursos de outra região", 403))
      }
    }

    if (req.user.permissao === "operador" && req.params.tribunalId) {
      // Operadores só podem acessar recursos do seu tribunal
      if (req.user.tribunalId !== Number.parseInt(req.params.tribunalId)) {
        return next(new AppError("Você não tem permissão para acessar recursos de outro tribunal", 403))
      }
    }

    next()
  }
}

