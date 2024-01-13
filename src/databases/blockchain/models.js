const Chain = require('./parents').Chain
const helpers = require('./helpers')

class NotesChain extends Chain {
    constructor(){        
        super('notes')
    }

    test(){        
        return helpers.readCluster("lena","notes")
    }
}

exports.NotesChain = NotesChain
