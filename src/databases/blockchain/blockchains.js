//import that secure hash algorithm from the crypto-js package
const SHA256 = require('crypto-js/sha256');
const CryptoJS = require('crypto-js');
const helpers = require('./helpers')

//create a JavaScript class to represent a Block
class Block{
  constructor(index, timestamp, data, previousHash, transaction,  hash = null){
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.transaction = transaction
    this.hash = (hash?hash:this.generateHash())
  }

  generateHash(){
    return SHA256(JSON.stringify(this.data)+ this.index + this.timestamp + this.previousHash).toString(CryptoJS.enc.Hex)
  }

  toJSON(){
    return {
        index:this.index,
        timestamp:this.timestamp,
        data:this.data,
        previousHash:this.previousHash,
        transaction:this.transaction,
        hash:this.hash 
    }
  }
}

class Blockchain{
    constructor(blockchain = null){
        if (blockchain){            
            this.restaure(blockchain)
        } else {
            this.init()
        }        
    }

    init(){
        this.blockchain = [this.createGenesisBlock()];
    }

    restaure(blockchain){
        
        this.blockchain = []
        for(let block of blockchain){            
            this.blockchain.push(new Block(block.index, block.timestamp, block.data, block.previousHash, block.transaction, block.hash))
        }
    }
    createGenesisBlock(){
        return new Block(0, new Date().getTime(), "origin", "0", helpers.TransactionEnum.COMMIT);
    }

    getTheLatestBlock(){
        return this.blockchain[this.blockchain.length - 1];
    }

    add(doc, transaction=helpers.TransactionEnum.COMMIT){
        let block = new Block(
            this.blockchain.length,
            new Date().getTime(),
            doc,            
            this.getTheLatestBlock().hash,
            transaction
        )
        block.hash = block.generateHash()
                
        this.blockchain.push(block);
    }

    // testing the integrity of the chain
    validateChainIntegrity(){
        for(let i = 1; i<this.blockchain.length; i++){        
            
            const currentBlock = this.blockchain[i];
            const previousBlock = this.blockchain[i-1];

            if(currentBlock.hash !== currentBlock.generateHash()){
                return false;
            }
            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
        }
        return true;
    }

    toJSON(){
        return this.blockchain.map(block => block.toJSON())
    }
} 


exports.Blockchain = Blockchain
exports.Block = Block