const Chain = require('./parents').Chain

class NotesChain extends Chain {
    constructor(){        
        super('notes')
    }
}

exports.NotesChain = NotesChain
