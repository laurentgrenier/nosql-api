const Cron = require('./cron.js')
const DatesLib = require('../libs/dates.lib')

class KeepaliveCron extends Cron {
  constructor(logger, services) {
    super(logger, services)            
  }

  do(){              
    const executed_at = DatesLib.newLocalDate()
    
    this.services.users.keepalive(executed_at)
  }
}

module.exports = KeepaliveCron

