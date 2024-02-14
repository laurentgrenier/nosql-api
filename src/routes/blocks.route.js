const Route = require('./route.js')

class BlockRoute extends Route {
  
  constructor(logger, services, root, monitoring) {    
    super(logger, services, root, monitoring)            
    this.set()
  }

  set(){
    let logger = this.logger
    let services = this.services
        
    this.router.post('/', 
      //this.services.authentications.passport.authenticate('account', {session: false}), 
      (req, res, next) => {       
        logger.debug('blocks POST', req.body)

        this.services.blocks.send(req.body).then(
          data => res.json({data:data}),
          error => {
            res.status(400);
            res.json({error:error})
          }
      )      
    })
  }
}

module.exports = BlockRoute
