const cron = require('node-cron')
const DatesLib = require('../libs/dates.lib')
class Cron {
    
    constructor(logger, services){
        this.cron = null
        this.logger = logger    
        this.services = services
        this.executed_at = DatesLib.newLocalDate()
        this.name = this.constructor.name.toLowerCase().substring(0,this.constructor.name.length - 4)        
        this.start()    
    }
 
    start() {
        this.logger.info("cron " + this.name + " starting ...")
        let schedule = JSON.parse(process.env.CRONS_SCHEDULE)[this.name]
        this.logger.info("cron " + this.name + " starting at " + schedule)
        if (!this.cron){
            this.cron = cron.schedule(schedule, () => {
                this.do()
              });
              this.logger.info("cron " + this.name + " scheduled at " + schedule)
        }        
    }
 
    stop(){    
        this.cron.stop() 
        this.logger.info("cron " + this.name + " stopped")
    }

    destroy(){
        this.cron.destroy()
        this.logger.info("cron " + this.name + " destroyed")
    }

    do(){
        console.log('running a task every minute at the 5th second');
    }
  }
  
  module.exports = Cron