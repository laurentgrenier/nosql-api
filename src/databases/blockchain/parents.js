const blockchains = require('./blockchains')
const helpers = require('./helpers')
const graph = require('../../databases/neo4j/models')

const blocksNode = new graph.BlocksNode()
const chainsRelation = new graph.ChainsRelation()
const copyRelation = new graph.CopyOfRelation()

class Chain {
    constructor(name){        
        this.name = name
    }

    async mapBlock(block, chainId, hostnames, className, previousNodes=[]){
        let nodes = {previous:previousNodes, current:[]}
        
        // add the block nodes to the graph
        for(var i=0;i<hostnames.length;i++){
            nodes.current.push(await blocksNode.insertOne({
                block_id:block.index.toString(), 
                chain_id:chainId, 
                class_name:className,                                 
                hostname:hostnames[i]}))
        }

        // link between current blocks
        for(var i=0;i<nodes.current.length;i++){
            let others = nodes.current.filter(node => node.id != nodes.current[i].id)                
            for(var j=0;j<others.length;j++){
                await copyRelation.insertOne(nodes.current[i].id, others[j].id, {chain_id:chainId, class_name:className})
            }
        }

        // link with previous blocks
        for(var i=0; i<nodes.previous.length; i++){
            for(var j=0; j<nodes.current.length; j++){
                await chainsRelation.insertOne(nodes.current[j].id, nodes.previous[i].id, 
                    {
                        chain_id:chainId, 
                        class_name:className,
                        cost: nodes.previous[i].hostname == nodes.current[j].hostname ? 0:1
                    })
            }
        }

        return nodes.current
    }

    async insertOne(doc){
        //let nodes = {previous:[], current:[]}
        let previousNodes = []
        // create a new blockchain
        let blockchain = new blockchains.Blockchain();

        // generate a blockchain id
        const id = helpers.generateId()        

        blockchain.add({id:helpers.generateGUID(), ...doc})
        //console.debug("block: ", block)
        //const hostnames = helpers.spreadBlockchain(this.name, id, blockchain.toJSON())      
        
        // add blocks to the graph
        for(var k=0;k<blockchain.blockchain.length;k++){
            let block = blockchain.blockchain[k]
            let hostnames = helpers.spreadBlock(this.name, id, block.toJSON()) 
            
            // add the block nodes to the graph
            /*for(var i=0;i<hostnames.length;i++){
                nodes.current.push(await blocksNode.insertOne({block_id:block.index.toString(), chain_id:id, name:this.name, hostname:hostnames[i]}))
            }

            // link between current blocks
            for(var i=0;i<nodes.current.length;i++){
                let others = nodes.current.filter(node => node.id != nodes.current[i].id)                
                for(var j=0;j<others.length;j++){
                    await copyRelation.insertOne(nodes.current[i].id, others[j].id, {chain_id:id, name:this.name})
                }
            }
    
            // link with previous blocks
            for(var i=0; i<nodes.previous.length; i++){
                for(var j=0; j<nodes.current.length; j++){
                    await chainsRelation.insertOne(nodes.current[j].id, nodes.previous[i].id, {chain_id:id, name:this.name})
                }
            }


            nodes.previous = nodes.current
            nodes.current = []*/

            previousNodes = await this.mapBlock(block, id, hostnames, this.name, previousNodes)
        }



        return {id:id, commitedCount:1}
    }

    findById(id){
        // rebuild the blockchain from the blockchain owners
        const raw = helpers.aggregateBlockchain(this.name, id)
        
        // check blockchain integrity
        let blockchain = new blockchains.Blockchain(raw)
        
        if (blockchain.validateChainIntegrity()){
            
            // rollbacked transactions document ids 
            let rollbackedDocumentsIds = blockchain.blockchain.filter(block => block.transaction == helpers.TransactionEnum.ROLLBACK).map(block => block.data.id)
            
            // remove rollbacked transactions
            let blocks = blockchain.blockchain.filter(block => !rollbackedDocumentsIds.includes(block.data.id))

            // return only the data
            return blocks.filter(block => block.index != 0).map(block => block.data)        
        } else {
            return {error:"blockchain is broken"}
        }
    }

    update(id, doc){
        // rebuild the blockchain from the blockchain owners
        const raw = helpers.aggregateBlockchain(this.name, id)

        // check blockchain integrity
        let blockchain = new blockchains.Blockchain(raw)
        
        if (blockchain.validateChainIntegrity()){
            // add a block
            blockchain.add({id:helpers.generateGUID(), ...doc}, helpers.TransactionEnum.COMMIT)

            // spread the modifications on each blockchain owner
            helpers.spreadBlockchain(this.name, id, blockchain.toJSON())      
            
            return {id:id, commitedCount:1}
        } else {
            return {error:"blockchain is broken"}
        }  
    }


    delete(id, docId){
        // rebuild the blockchain from the blockchain owners
        const raw = helpers.aggregateBlockchain(this.name, id)

        // check blockchain integrity
        let blockchain = new blockchains.Blockchain(raw)
        
        if (blockchain.validateChainIntegrity()){
            // add a rollback transaction
            blockchain.add({id:docId}, helpers.TransactionEnum.ROLLBACK)

            // spread the modifications on each blockchain owner
            helpers.spreadBlockchain(this.name, id, blockchain.toJSON())      
            
            return {id:id, rollbackedCount:1}            
        } else {
            return {error:"blockchain is broken"}
        }  
    }


}

exports.Chain = Chain
