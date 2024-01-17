const Chain = require('./parents').Chain
const helpers = require('./helpers')

class NotesChain extends Chain {
    constructor(){        
        super('notes')
    }
}

exports.NotesChain = NotesChain
