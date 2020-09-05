const elasticLunr = require('elasticlunr')
const { json } = require('micro')
const { send } = require('micro')
const mkdirp = require('mkdirp')
const path = require('path')
const fs = require('fs').promises
const asciiFolder = require('fold-to-ascii')

require('lunr-languages/lunr.stemmer.support')(elasticLunr)
require('lunr-languages/lunr.pt')(elasticLunr)

module.exports = async (req, res, indexFilePath) => {
  const body = await json(req)
  const { config } = body

  const replaceDiacritics = token => asciiFolder.foldReplacing(token)
  elasticLunr.Pipeline.registerFunction(replaceDiacritics, 'replaceDiacritics')

  const index = elasticLunr(function () {
    config.searchFields.forEach(field => this.addField(field))

    const lunrPt = function () {
      this.pipeline.reset()
      this.pipeline.add(replaceDiacritics) // notice this comes before the rest!
      this.pipeline.add(elasticLunr.pt.trimmer, elasticLunr.pt.stopWordFilter, elasticLunr.pt.stemmer)
    }
    this.use(lunrPt)
    this.setRef('id')
    this.saveDocument(config.saveDocument)
  })
  // FIXME: não falhar se um documento ou outro estiver fora do padrão - logar
  body.documents.forEach((item) => {
    index.addDoc(item)
  })
  await mkdirp(path.dirname(indexFilePath))
  await fs.writeFile(indexFilePath, JSON.stringify(index))
  return send(res, 200, 'Índice criado com sucesso.')
}
