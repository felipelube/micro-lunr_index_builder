const { createError } = require('micro')
const { default: parseBearerToken } = require('parse-bearer-token')

module.exports = async (req, authToken) => {
  if (req.method !== 'POST') {
    throw createError(405, 'Método não permitido')
  } else {
    const providedToken = parseBearerToken(req)
    if (!providedToken) {
      throw createError(401, 'Falta o token de autenticação')
    }
    if (authToken !== providedToken) {
      throw createError(403, 'Token de autenticação inválido')
    }
  }
}
