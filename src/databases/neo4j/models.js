const HostStatus = require('../../enums/blockdb.enums').HostStatusEnum
const { GraphNodeClassEnum, GraphRelationClassEnum } = require('../../enums/blockdb.enums')
const parents = require('./parents')
const helpers = require('./helpers')
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

class BlocksNodes extends Node {
    constructor(){
        super(GraphNodeClassEnum.BLOCK)
    }

    async getActivesChainNodesBlocks(chainId){
        let results = []
        // get all nodes with an active host        
        const chainsNodesBlocks = await this.exec(helpers.getActivesChainNodesBlocksQuery(chainId))
        
        // get distinct
        const chainsNodesBlocksIndexes = [...new Set(chainsNodesBlocks.map(n => n.block_index))]
        
        for(var i=0; i<chainsNodesBlocksIndexes.length; i++){
            let chainsNodesBlocksTmp = chainsNodesBlocks.filter(n => n.block_index == chainsNodesBlocksIndexes[i])
            results.push(chainsNodesBlocksTmp[parseInt(Math.random() * chainsNodesBlocksTmp.length)])
        }

        return results
    }

    async getLeafNodesBlocksIds(chainId){
        // get Leaf nodes ids
        return await this.exec(helpers.getLeafBlockNodeQuery(chainId))
    }
}

class HostsNode extends Node {
    constructor(){
        super(GraphNodeClassEnum.HOST)
    }

    getActives(){
        return this.findAll({active:HostStatus.ACTIVE})
    }
}

class ChainedToRelation extends Relation {
    constructor(){
        super(GraphRelationClassEnum.CHAINED_TO, GraphNodeClassEnum.BLOCK, GraphNodeClassEnum.BLOCK)
    }    
}

class HostedByRelation extends Relation {
    constructor(){
        super(GraphRelationClassEnum.HOSTED_BY, GraphNodeClassEnum.BLOCK, GraphNodeClassEnum.HOST)
    }    
}

class CopyOfRelation extends Relation {
    constructor(){
        super(GraphRelationClassEnum.COPY_OF, GraphNodeClassEnum.BLOCK, GraphNodeClassEnum.BLOCK)
    }    
}


exports.ArticlesNode = ArticlesNode
exports.EditorsNode = EditorsNode
exports.WritesRelation = WritesRelation
exports.BlocksNodes = BlocksNodes
exports.ChainedToRelation = ChainedToRelation
exports.CopyOfRelation = CopyOfRelation
exports.HostedByRelation = HostedByRelation
exports.HostsNode = HostsNode