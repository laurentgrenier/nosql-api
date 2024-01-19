const blockchains = require('./blockchains')
const helpers = require('./helpers')
const graph = require('../../databases/neo4j/models')
const BlockchainType = require('../../enums/blockdb.enums').BlockchainTypeEnum
const HostStatus = require('../../enums/blockdb.enums').HostStatusEnum
const caches = require('../redis/models')

// import caches 
const hostsReadsCache = new caches.HostsReadsCache()
const hostsWritesCache = new caches.HostsWritesCache()

// import graph nodes
const blocksNodes = new graph.BlocksNodes()
const blockchainsNodes = new graph.BlockchainsNodes()
const hostsNodes = new graph.HostsNodes()
const clustersNodes = new graph.ClustersNodes()

// import graph relations
const chainedToRelation = new graph.ChainedToRelation()
const copyOfRelation = new graph.CopyOfRelation()
const partOfRelation = new graph.PartOfRelation()
const rootOfRelation = new graph.RootOfRelation()
const hostedByRelation = new graph.HostedByRelation()

class Chain {
    constructor(name){        
        this.name = name
    }

    async mapRootBlock(block, chainId, hosts, className, blockchainNode){
        let nodes = []
        
        // create a node for the block
        let blockNode = await blocksNodes.insertOne({
            block_index:block.index.toString(), 
            chain_id:chainId, 
            class_name:className})

        // add the node to current ones
        nodes.push(blockNode)
        
        // add the block nodes to the graph
        for(var i=0;i<hosts.length;i++){
            // link the node with its host
            await hostedByRelation.insertOne(blockNode.id, hosts[i].id, {chain_id:chainId})
        }

        // link between current blocks
        /*for(var i=0;i<nodes.length;i++){
            let others = nodes.filter(node => node.id != nodes[i].id)                
            for(var j=0;j<others.length;j++){
                await copyOfRelation.insertOne(nodes[i].id, others[j].id, {chain_id:chainId, class_name:className})
            }
        }*/

        // link with blockchain node        
        for(var i=0; i<nodes.length; i++){
            await rootOfRelation.insertOne(nodes[i].id, blockchainNode.id, 
                {
                    chain_id:chainId, 
                    class_name:className
                })
        }
    

        return nodes
    }

    async mapChainBlock(block, chainId, hosts, className, previousNodes=[]){
        let nodes = {previous:previousNodes, current:[]}
        
        // create a node for the block
        let blockNode = await blocksNodes.insertOne({
            block_index:block.index.toString(), 
            chain_id:chainId, 
            class_name:className})

        // add the node to current ones
        nodes.current.push(blockNode)
        
        // add the block nodes to the graph
        for(var i=0;i<hosts.length;i++){            
            // link the node with its host
            await hostedByRelation.insertOne(blockNode.id, hosts[i].id, {chain_id:chainId})
        }

        // link between current blocks
        /*for(var i=0;i<nodes.current.length;i++){
            let others = nodes.current.filter(node => node.id != nodes.current[i].id)                
            for(var j=0;j<others.length;j++){
                await copyOfRelation.insertOne(nodes.current[i].id, others[j].id, {chain_id:chainId, class_name:className})
            }
        }*/

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

    async getAllHosts(){
        return helpers.getAllHosts()
    }

    async initHosts(){
        let existingHost = null 
        const hosts = helpers.getAllHosts()
        for(var i=0;i<hosts.length;i++){
            existingHost = await hostsNodes.find({name:hosts[i].name})
            
            if (existingHost == null){
                await hostsNodes.insertOne({name:hosts[i].name, active: HostStatus.ACTIVE})                
            }

            if (!(await hostsReadsCache.exists(hosts[i].name))) {
                hostsReadsCache.set(hosts[i].name, 0)
            }


            if (!(await hostsWritesCache.exists(hosts[i].name))) {
                hostsWritesCache.set(hosts[i].name, 0)
            }
            
        }
        return hosts
    }

    /**
     * Init a blockchain cluster if it does not exist
     * @param {*} className the class name of the cluster 
     */
    async initCluster(className){
        const existing = await clustersNodes.find({class_name:className})
        if (existing){
            return existing
        } else {
            return await clustersNodes.insertOne({class_name:className})
        }
    }

    /**
     * Creates a new blockchain
     * @param {*} doc the first block of the chain 
     * @param {*} chainType the type of the chain from BlockchainTypeEnum
     * @returns {*} {id:string, commitedCount:int} identifier of the blockchain, number of blocks added to the blockchain
     */
    async insertOne(doc, chainType){
        // init the list of hosts 
        await this.initHosts()
        
        let usedHosts = []
        let previousNodes = []

        // create a new blockchain
        let blockchain = new blockchains.Blockchain(null);
        
        // generate a blockchain id
        const chainId = blockchain.id

        // init the list of clusters
        const clusterNode = await this.initCluster(this.name)

        let blockchainNodeProperties = {chain_id:chainId, chain_type: chainType, class_name:this.name}
        const documentId = helpers.generateGUID() 

        switch(chainType){
            case BlockchainType.SERIES:
                doc = {id:documentId, ...doc}                
                break;
            case BlockchainType.CUMULATIVE_RECORD:                
                blockchainNodeProperties = Object.assign({document_id:documentId}, blockchainNodeProperties)
                doc = {id:documentId, ...doc}
                break;
            case BlockchainType.CUMULATIVE_RECORD:                
                blockchainNodeProperties = Object.assign({document_id:documentId}, blockchainNodeProperties)
                doc = {id:documentId, ...doc}
                break;
            default:
                throw "unknown blockchain type " + chainType                
        }

        // create the blockchain node
        const blockchainNode = await blockchainsNodes.insertOne(blockchainNodeProperties)

        // link the blockhain node to the cluster
        await partOfRelation.insertOne(blockchainNode.id, clusterNode.id, {chain_id:chainId, class_name:this.name})

        // link the root node to the blockchain node
        //await rootOfRelation.insertOne(blockchain.blockchain[0].id, blockchainNode.id, {chain_id:chainId, class_name:this.name})

   
        // add the first data block
        blockchain.add(doc)
                
        const hosts = await hostsNodes.getActives()        
        
        // add the root block
        let block = blockchain.blockchain[0]        
        usedHosts = helpers.spreadBlockToHosts(this.name, chainId, block.toJSON(), hosts) 
        previousNodes = await this.mapRootBlock(block, chainId, usedHosts, this.name, blockchainNode)

        // add blocks to the graph
        for(var k=1;k<blockchain.blockchain.length;k++){
            block = blockchain.blockchain[k]
            usedHosts = helpers.spreadBlockToHosts(this.name, chainId, block.toJSON(), hosts) 
            
            previousNodes = await this.mapChainBlock(block, chainId, usedHosts, this.name, previousNodes)
        }



        return {id:chainId, commitedCount:1}
    }

    async findById(chainId){
        const chainNodesBlocks = await blocksNodes.getActivesChainNodesBlocks(chainId)        
        
        // rebuild the blockchain from the blockchain owners
        const raw = helpers.aggregateBlockchain(this.name, chainId, chainNodesBlocks)
        
        // check blockchain integrity
        let blockchain = new blockchains.Blockchain(raw)
        
        if (blockchain.validateChainIntegrity()){
            const blockchainNode = await blockchainsNodes.find({chain_id:chainId})
            
            // rollbacked transactions document ids 
            let rollbackedDocumentsIds = blockchain.blockchain.filter(block => block.transaction == helpers.TransactionEnum.ROLLBACK).map(block => block.data.id)
            
            // remove rollbacked transactions
            let blocks = blockchain.blockchain.filter(block => !rollbackedDocumentsIds.includes(block.data.id))
            
            // return only the data            
            return helpers.parseBlocksData(blocks, blockchainNode.chain_type)
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
            
            // get the blockchain node
            const blockchainNode = await blockchainsNodes.find({chain_id:chainId})
            console.debug("blockchainNode", blockchainNode)

            // set the document identifier
            switch(blockchainNode.chain_type){
                case BlockchainType.SERIES:
                    doc = {id:helpers.generateGUID(), ...doc}
                    break;
                case BlockchainType.CUMULATIVE_RECORD:
                    doc = {id:blockchainNode.document_id, ...doc}
                    break;
                case BlockchainType.VERSIONED_RECORD:
                    doc = {id:blockchainNode.document_id, ...doc}
                    break;
                default:
                    throw "unknown blockchain type " + blockchainNode.chain_type 
            }

            // add a block
            const block = blockchain.add(doc, helpers.TransactionEnum.COMMIT)

            // spread the modifications on each blockchain owner
            // helpers.spreadBlockchain(this.name, chainId, blockchain.toJSON())      
            const hosts = await hostsNodes.getActives()        

            // add blocks to the graph
            const usedHosts = helpers.spreadBlockToHosts(this.name, chainId, block.toJSON(), hosts) 
            
            await this.mapChainBlock(block, chainId, usedHosts, this.name, previousNodes)
            
            return {id:chainId, commitedCount:1}
        } else {
            return {error:"blockchain is broken"}
        }  
    }


    async delete(chainId, docId){
        // rebuild the blockchain from the blockchain owners
        const raw = helpers.aggregateBlockchain(this.name, chainId)

        // check blockchain integrity
        let blockchain = new blockchains.Blockchain(raw)
        
        if (blockchain.validateChainIntegrity()){
            // add a rollback transaction
            const block = blockchain.add({id:docId}, helpers.TransactionEnum.ROLLBACK)

            // spread the modifications on each blockchain owner
            const hosts = await hostsNodes.getActives()        

            // add blocks to the graph
            const usedHosts = helpers.spreadBlockToHosts(this.name, chainId, block.toJSON(), hosts) 
            
            return {id:chainId, rollbackedCount:1}            
        } else {
            return {error:"blockchain is broken"}
        }  
    }


}

exports.Chain = Chain
