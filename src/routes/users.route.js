const Route = require('./route.js')

class UsersRoute extends Route {
  
  constructor(logger, services, root, monitoring) {    
    super(logger, services, root, monitoring)            
    this.set()
  }

  set(){
    let logger = this.logger
    let services = this.services
        
    this.router.get('/connected', 
      //this.services.authentications.passport.authenticate('account', {session: false}), 
      (req, res, next) => {       
        logger.debug('users GET connected')

        this.services.users.getConnected().then(
          data => res.json({data:data}),
          error => {
            res.status(400);
            res.json({error:error})
          }
      )      
    })

    this.router.delete('/connected', 
      //this.services.authentications.passport.authenticate('account', {session: false}), 
      (req, res, next) => {       
        logger.debug('users DELETE connected')

        this.services.users.flushAllConnected().then(
          data => res.json({data:data}),
          error => {
            res.status(400);
            res.json({error:error})
          }
      )      
    })    
  }
}

module.exports = UsersRoute
