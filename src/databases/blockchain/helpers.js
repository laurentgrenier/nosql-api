const fs = require('fs');

const TransactionEnum = Object.freeze({
    COMMIT:"COMMIT",
    ROLLBACK:"ROLLBACK"
})

const generateId = () => {    
    const ID_LENGTH = 16 
    let chars = "abcdefghijklmnopqrstuvwxyz1234567890"
    let id = ""

    for (var i=0;i<ID_LENGTH;i++){
        id += chars[Math.floor(Math.random() * chars.length)]
    }    

    return id
}

const generateGUID = () => {        
    const GUID_LENGTH = 32
    let chars = "abcdefghijklmnopqrstuvwxyz1234567890"
    let code = ""

    for (var i=0;i<GUID_LENGTH;i++){
        code += chars[Math.floor(Math.random() * chars.length)]
    }    
    
    return code.slice(0,8) + "-" + code.slice(8,12) + "-" + code.slice(12,16)+ "-" + code.slice(16,20)+ "-" + code.slice(20,32)
}

const getBlockchainFileName = (user, name, id) => {
    return process.env.BLOCKCHAIN_EMULATION_FOLDER + "/blockchain_" + id + "_" + name + "_" + user + ".json"
}

const readBlockchain = (user, name, id) => {
    var result = []
    try {
        const raw = fs.readFileSync(getBlockchainFileName(user, name, id))
        return JSON.parse(raw)        
    } catch (error) {
        console.debug("no file found")        
    }
    return result
}

const writeBlockchain = (user, name, id, blockchain) => {
    let data = JSON.stringify(blockchain);    
    // check integrity    
    fs.writeFileSync(getBlockchainFileName(user, name, id), data);
}

const aggregateBlockchain = (name, id) => {
    // select an user randomly
    const users = JSON.parse(process.env.BLOCKCHAIN_USERS)
    const user = users[Math.floor(Math.random() * users.length)]
    
    // read the data from the user
    return readBlockchain(user, name, id)    
}

const spreadBlockchain = (name, id, blockchain) => {
    const users = JSON.parse(process.env.BLOCKCHAIN_USERS)
    for(let user of users){
        writeBlockchain(user, name, id, blockchain)
    }
    return true
}

exports.generateId = generateId
exports.writeBlockchain = writeBlockchain
exports.readBlockchain = readBlockchain
exports.spreadBlockchain = spreadBlockchain
exports.aggregateBlockchain = aggregateBlockchain
exports.generateGUID = generateGUID
exports.TransactionEnum = TransactionEnum