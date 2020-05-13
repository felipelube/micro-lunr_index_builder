const { json, createError, send } = require('micro')
const schema = require('./bodySchema.json')
const Ajv = require('ajv')
const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}
const validate = ajv.compile(schema)

module.exports = async (req, res) => {
  const body = await json(req)
  const valid = await validate(body)
  if (!valid) {
    const validationError = new Ajv.ValidationError(validate.errors)
    throw createError(400, 'Erro de validação', validationError)
  }
}
