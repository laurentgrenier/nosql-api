
const parents = require('./parents')
const Node = parents.Node
const Relation = parents.Relation

class ArticlesNode extends Node {
    constructor(){
        super('Article')
    }
}

class EditorsNode extends Node {
    constructor(){
        super('Editor')
    }
}

class WritesRelation extends Relation {
    constructor(){
        super('WRITES', 'Editor', 'Article')
    }    
}

exports.ArticlesNode = ArticlesNode
exports.EditorsNode = EditorsNode
exports.WritesRelation = WritesRelation