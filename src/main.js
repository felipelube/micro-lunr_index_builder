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

if (!authToken) {
  console.error('NENHUM TOKEN DE AUTENTICAÇÃO FOI DEFINIDO, SAINDO.')
  process.exit(9)
}

const handleErrors = fn => async (req, res) => {
  try {
    return await fn(req, res)
  } catch (err) {
    if (process.env.NODE_ENV && process.NODE_ENV === 'development') {
      console.error(err.stack)
    }
    console.error(err.message)
    if (err.statusCode) {
      if (err.originalError instanceof ValidationError) {
        return send(res, err.statusCode, err.originalError.errors)
      }
      return send(res, err.statusCode, err.message)
    }
    return send(res, 500, 'Erro interno do servidor')
  }
}

const main = async (req, res) => {
  await authenticate(req, authToken)
  await validate(req)
  await buildIndex(req, res, indexFilePath)
}

module.exports = handleErrors(async (req, res) => {
  await promiseTimeout(timeout, await main(req, res))
})
