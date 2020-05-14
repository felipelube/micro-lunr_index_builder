// http://disq.us/p/1k8w63m
function promiseTimeout (ms, promise) {
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
  })
}

module.exports = promiseTimeout
