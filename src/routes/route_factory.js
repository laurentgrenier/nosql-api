const fs = require('fs')
const path = require('path')

const repo = path.join(__dirname)

const libs = fs.readdirSync(repo)
  .filter(l => l.endsWith('.route.js'))
  .map(o => path.parse(o).name)

module.exports = function (logger, services) {
  return libs.reduce((objs, lib) => {
    objs[lib.replace(".route","")] = new (require(path.join(repo, lib)))(logger, services, "/" + lib.replace(".route",""))
    return objs
  }, {})
}
