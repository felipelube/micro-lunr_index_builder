// http://disq.us/p/1k8w63m
/**
 * Função que executa uma promessa em até determinado timeout. Se o timeout extrapolar, a função inteira falha.
 * @param {*} ms
 * @param {*} promise
 */
module.exports = (ms, promise) => {
  let timer
  const timeout = new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      reject(new Error('Timed out in ' + ms + 'ms.'))
    }, ms)
  })

  return Promise.race([
    promise,
    timeout
  ]).then((result) => {
    clearTimeout(timer)
    return result
  }).catch(() => {
    clearTimeout(timer)
  })
}
