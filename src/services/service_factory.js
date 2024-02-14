const fs = require('fs')
const path = require('path')


const repo = path.join(__dirname)

const libs = fs.readdirSync(repo)
  .filter(l => l.endsWith('.service.js'))
  .map(o => path.parse(o).name)

module.exports = function (logger, dal, socket, apis) {
  return libs.reduce((objs, lib) => {
    objs[lib.replace(".service","")] = new (require(path.join(repo, lib)))(logger, dal, socket, apis)
    return objs
  }, {})
}
