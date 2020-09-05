const { send } = require('micro')
const { ValidationError } = require('ajv')

const authenticate = require('./lib/auth')
const buildIndex = require('./lib/searchIndex')
const promiseTimeout = require('./lib/util')
const validate = require('./lib/validation')

// TODO: timeout deve ser passado pelo cliente
const timeout = parseInt(process.env.TIMEOUT, 10) * 1000 || 30 * 1000
const indexFilePath = process.env.INDEX_FILE_PATH || './index.json'
const authToken = process.env.AUTH_TOKEN

// Falhe rapidamente caso o token de autenticação não esteja definido
if (!authToken) {
  console.error('NENHUM TOKEN DE AUTENTICAÇÃO FOI DEFINIDO, SAINDO.')
  process.exit(9)
}

/**
 * Tente executar fn e, em caso de erros, logue-os no console e retorne uma resposta http com informações.
 * @param {*} fn
 */
const handleErrors = fn => async (req, res) => {
  try {
    return await fn(req, res)
  } catch (err) {
    // logue informações adicionais sobre o erro  se estivermos em ambiente de desenvolvimento
    if (process.env.NODE_ENV && process.NODE_ENV === 'development') {
      console.error(err.stack)
    }
    console.error(err.message)
    if (err.statusCode) {
      // se for um erro de validação, adicione informações sobre quais campos falharam a validação do json schema
      if (err.originalError instanceof ValidationError) {
        return send(res, err.statusCode, err.originalError.errors)
      }
      return send(res, err.statusCode, err.message)
    }
    return send(res, 500, 'Erro interno do servidor')
  }
}

/**
 * Pipeline para lidar com requisições: autenticação, validação e processamento.
 * @param {*} req
 * @param {*} res
 */
const handleRequest = async (req, res) => {
  await authenticate(req, authToken)
  await validate(req)
  await buildIndex(req, res, indexFilePath)
}

/**
 * Empacote todo o processamento dentro de uma função que falhará se o timeout for extrapolado.
 */
module.exports = handleErrors(async (req, res) => {
  await promiseTimeout(timeout, await handleRequest(req, res))
})
