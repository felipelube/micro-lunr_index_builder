const elasticLunr = require('elasticlunr')
const { json } = require('micro')
const { createError } = require('micro')
const fs = require('fs')

module.exports = async (req, indexFilePath) => {
  const body = await json(req)
  const searchFields = body.fields || ['title', 'teaser']

  if (!body || !Array.isArray(body) || !body.length) {
    throw createError(400)
  }
  const index = elasticLunr(function () {
    this.addField('title')
    this.addField('teaser')
    this.setRef('id')
    this.saveDocument(true)
  })
  // FIXME: não falhar se um documento ou outro estiver fora do padrão - logar
  body.forEach((item) => {
    index.addDoc(item)
  })
  fs.writeFileSync(indexFilePath, JSON.stringify(index))
}
