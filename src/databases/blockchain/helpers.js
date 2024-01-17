const fs = require('fs');
const os = require('os')

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

const getBlockchainIds = (user, name) => {
    var regexPattern = new RegExp("blockchain_[a-zA-Z0-9]{8,32}_" + name + "_" + user +  ".json", "g");    
    return fs.readdirSync(process.env.BLOCKCHAIN_EMULATION_FOLDER)
        .filter(file => file.match(regexPattern))            
        .map(filename => filename.split("_")[1])
}

const readBlockchain = (chainId, className, blocks) => {
    var result = []
    var blocksIndexesToRead = null
    try {
        // get each hostname
        const hostnames = [...new Set(blocks.map(b => b.hostname))]
        
        // read blocks from each listed host
        for(var i=0;i<hostnames.length;i++){
            blocksIndexesToRead = blocks.filter(b => b.hostname == hostnames[i]).map(b => parseInt(b.block_index))
            result = result.concat(readBlocks(chainId, className, hostnames[i], blocksIndexesToRead))
        }

        return result.sort((b1,b2)=>(b1.index > b2.index ? 1:-1))
    } catch (error) {
        console.debug("error", error)
        console.debug("no file found")        
    }
    return result 
}

const readBlocks = (chainId, className, hostname, blocksIndexesToRead) => {    
    try {
        const data = fs.readFileSync(getBlockchainFileName(hostname, className, chainId)).toString().split("\n").filter(line => line.length > 0).map(line => JSON.parse(line));    
        
        return data.filter(b => blocksIndexesToRead.includes(parseInt(b.index)))
    } catch (error) {
        console.debug("error", error)
        console.debug("no file found")        
    }
    return result 
}

const readCluster = (user, name) => {
    var result = []
    try {
        let raw =  null
        
        let ids = getBlockchainIds(user, name)
        for(var i=0;i<ids.length;i++){
            result.push(readBlockchain(user, name, ids[i]))            
        }
        return result
    } catch (error) {
        console.debug("error", error)
        console.debug("no file found")        

    }
    return result
}

const writeBlockchain = (user, name, id, blockchain) => {
    let data = JSON.stringify(blockchain);    
    // check integrity    
    fs.writeFileSync(getBlockchainFileName(user, name, id), data);
}

const writeBlock = (user, name, id, block) => {
    try {
        let data = JSON.stringify(block) + os.EOL;    
        const filename = getBlockchainFileName(user, name, id)
        if (fs.existsSync(filename)){
            fs.appendFileSync(filename, data);
        } else {
            fs.writeFileSync(filename, data);
        }
        return true
    } catch (error) {
        console.error("error while writting block " + name + " to user " + user)
    }
    return false
}

const aggregateBlockchain = (className, chainId, blocks) => {
    // read the data from the user
    return readBlockchain(chainId, className, blocks)    
}

const spreadBlockchain = (name, id, blockchain) => {
    let hostnames = []
    const users = JSON.parse(process.env.BLOCKCHAIN_USERS).sort(() => (Math.random() > .5) ? 1 : -1)
    const replicationFactor = JSON.parse(process.env.BLOCKCHAIN_REPLICATION_FACTOR)
    
    for(var i=0;i<replicationFactor;i++){ 
        writeBlockchain(users[i], name, id, blockchain)
        hostnames.push(users[i])
    }
    return hostnames
}

const spreadBlock = (name, id, block) => {
    let hostnames = []
    const users = JSON.parse(process.env.BLOCKCHAIN_USERS).sort(() => (Math.random() > .5) ? 1 : -1)
    const replicationFactor = JSON.parse(process.env.BLOCKCHAIN_REPLICATION_FACTOR)
    
    for(var i=0;i<replicationFactor;i++){ 
        writeBlock(users[i], name, id, block)
        hostnames.push(users[i])
    }
    return hostnames
}

const spreadBlockToHosts = (name, id, block, hosts) => {    
    let usedHosts = []
    hosts = hosts.sort(() => (Math.random() > .5) ? 1 : -1)
    const replicationFactor = JSON.parse(process.env.BLOCKCHAIN_REPLICATION_FACTOR)
    
    for(var i=0;i<replicationFactor;i++){ 
        if (writeBlock(hosts[i].name, name, id, block)){
            usedHosts.push(hosts[i])
        }
    }

    return usedHosts
}

const getAllHosts = () => {
    return JSON.parse(process.env.BLOCKCHAIN_HOSTS) 
}

exports.generateId = generateId
exports.writeBlockchain = writeBlockchain
exports.readBlockchain = readBlockchain
exports.spreadBlockchain = spreadBlockchain
exports.spreadBlock = spreadBlock
exports.aggregateBlockchain = aggregateBlockchain
exports.generateGUID = generateGUID
exports.TransactionEnum = TransactionEnum
exports.readCluster = readCluster
exports.spreadBlockToHosts = spreadBlockToHosts
exports.getAllHosts = getAllHosts