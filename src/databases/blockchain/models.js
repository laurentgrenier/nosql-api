const Chain = require('./parents').Chain

class GenChain extends Chain {
    constructor(name){        
        super(name)
    }
}

exports.GenChain = GenChain
