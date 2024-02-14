const fs = require('fs')
const path = require('path')

const repo = path.join(__dirname)

const libs = fs.readdirSync(repo)
  .filter(l => l.endsWith('.cron.js'))
  .map(o => path.parse(o).name)

module.exports = function (logger, services) {
  return libs.reduce((objs, lib) => {
    // builds the service
    objs[lib.replace(".cron","")] = new (require(path.join(repo, lib)))(logger, services)
    return objs
  }, {})
}
