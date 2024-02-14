
class Service {
    constructor(logger, dal, socket, apis){
        this.dal = dal
        this.logger = logger            
        this.socket = socket
        this.apis = apis
        
        
    }
}

module.exports = Service