const express = require('express')

class Route {
    constructor(logger, service, root){
        this.services = service
        this.logger = logger     
        this.root = root
        this.router = express.Router()  
    }
}

module.exports = Route  