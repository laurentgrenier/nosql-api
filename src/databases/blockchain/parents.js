const blockchains = require('./blockchains')
const helpers = require('./helpers')
const graph = require('../../databases/neo4j/models')
const HostStatus = require('../../enums/blockdb.enums').HostStatusEnum

const blocksNodes = new graph.BlocksNodes()
const chainedToRelation = new graph.ChainedToRelation()
const copyOfRelation = new graph.CopyOfRelation()
const hostedByRelation = new graph.HostedByRelation()
const hostsNode = new graph.HostsNode()

class Chain {
    constructor(name){        
        this.name = name
    }

    async mapBlock(block, chainId, hosts, className, previousNodes=[]){
        let nodes = {previous:previousNodes, current:[]}
        
        // add the block nodes to the graph
        for(var i=0;i<hosts.length;i++){
            // create a node for the block
            let blockNode = await blocksNodes.insertOne({
                block_index:block.index.toString(), 
                chain_id:chainId, 
                class_name:className})

            // add the node to current ones
            nodes.current.push(blockNode)

            // link the node with its host
            await hostedByRelation.insertOne(blockNode.id, hosts[i].id, {chain_id:chainId})
        }

        // link between current blocks
        for(var i=0;i<nodes.current.length;i++){
            let others = nodes.current.filter(node => node.id != nodes.current[i].id)                
            for(var j=0;j<others.length;j++){
                await copyOfRelation.insertOne(nodes.current[i].id, others[j].id, {chain_id:chainId, class_name:className})
            }
        }

        // link with previous blocks
        for(var i=0; i<nodes.previous.length; i++){
            for(var j=0; j<nodes.current.length; j++){
                await chainedToRelation.insertOne(nodes.current[j].id, nodes.previous[i].id, 
                    {
                        chain_id:chainId, 
                        class_name:className,
                        cost: nodes.previous[i].hostname == nodes.current[j].hostname ? 0:1
                    })
            }
        }

        return nodes.current
    }

    async initHosts(){
        let existingHost = null 
        const hosts = helpers.getAllHosts()
        for(var i=0;i<hosts.length;i++){
            existingHost = await hostsNode.find({name:hosts[i].name})
            
            if (existingHost == null){
                await hostsNode.insertOne({name:hosts[i].name, active:HostStatus.ACTIVE})
            }
            
        }
        return hosts
    }

    async insertOne(doc){
        await this.initHosts()
        let usedHosts = []
        let previousNodes = []

        // create a new blockchain
        let blockchain = new blockchains.Blockchain();

        // generate a blockchain id
        const id = helpers.generateId()        

        blockchain.add({id:helpers.generateGUID(), ...doc})
        
        const hosts = await hostsNode.getActives()        

        // add blocks to the graph
        for(var k=0;k<blockchain.blockchain.length;k++){
            let block = blockchain.blockchain[k]
            usedHosts = helpers.spreadBlockToHosts(this.name, id, block.toJSON(), hosts) 
            
            previousNodes = await this.mapBlock(block, id, usedHosts, this.name, previousNodes)
        }



        return {id:id, commitedCount:1}
    }

    async findById(chainId){
        const chainNodesBlocks = await blocksNodes.getActivesChainNodesBlocks(chainId)        
        
        // rebuild the blockchain from the blockchain owners
        const raw = helpers.aggregateBlockchain(this.name, chainId, chainNodesBlocks)
        
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

    async update(chainId, doc){
        const chainNodesBlocks = await blocksNodes.getActivesChainNodesBlocks(chainId)        
        const previousNodes = await blocksNodes.getLeafNodesBlocksIds(chainId)

        // get all blocks from hosts
        const raw = helpers.aggregateBlockchain(this.name, chainId, chainNodesBlocks)

        // rebuild the blockchain from the blockchain owners
        let blockchain = new blockchains.Blockchain(raw)

        // check blockchain integrity
        if (blockchain.validateChainIntegrity()){
            // add a block
            const block = blockchain.add({id:helpers.generateGUID(), ...doc}, helpers.TransactionEnum.COMMIT)

            // spread the modifications on each blockchain owner
            // helpers.spreadBlockchain(this.name, chainId, blockchain.toJSON())      
            const hosts = await hostsNode.getActives()        

            // add blocks to the graph
            const usedHosts = helpers.spreadBlockToHosts(this.name, chainId, block.toJSON(), hosts) 
            
            await this.mapBlock(block, chainId, usedHosts, this.name, previousNodes)
            
            return {id:chainId, commitedCount:1}
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
