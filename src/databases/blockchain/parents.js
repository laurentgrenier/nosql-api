const blockchains = require('./blockchains')
const helpers = require('./helpers')

class Chain {
    constructor(name){        
        this.name = name
    }

    insertOne(doc){
        // create a new blockchain
        let blockchain = new blockchains.Blockchain();

        // get
        const id = helpers.generateId()        

        blockchain.add({id:helpers.generateGUID(), ...doc})

        helpers.spreadBlockchain(this.name, id, blockchain.toJSON())      
        
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
