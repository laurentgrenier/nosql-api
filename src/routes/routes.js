const express = require('express');
const router = express.Router()
const caches = require('../databases/redis/models')
const graph = require('../databases/neo4j/models')
const blockchain = require('../databases/blockchain/models')
const BlockchainType = require('../enums/blockdb.enums').BlockchainTypeEnum

// import caches 
const hostsReadsCache = new caches.HostsReadsCache()
const hostsWritesCache = new caches.HostsWritesCache()

// import graphs
const blocksNodes = new graph.BlocksNodes()
const hostsNodes = new graph.HostsNodes()

// import blockchain



//////////////////////////////////////
//             healthcheck
//////////////////////////////////////
// set an instant
router.get('/healthcheck', async (req, res) => {
    try{        
        res.json({status:"ready"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})


//////////////////////////////////////
//             BLOCK NODE
//////////////////////////////////////
// get all blocks from the graph
router.get('/nodes/blocks', async (req, res) => {
    try{        
        const data = await blocksNodes.findAll()
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// get a block
router.get('/nodes/blocks/:id', async (req, res) => {
    try{
        const data = await blocksNodes.findById(req.params.id)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// add a block
router.post('/nodes/blocks', async (req, res) => {
    try{
        const data = await blocksNodes.insertOne(req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// add multiples blocks
router.put('/nodes/blocks', async (req, res) => {
    try{
        const data = await articlesNode.insertMany(req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// delete a block
router.delete('/nodes/blocks/:id', async (req, res) => {
    try{
        const data = await blocksNodes.delete(req.params.id)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// update a block
router.patch('/nodes/blocks/:id', async (req, res) => {
    try{
        const data = await blocksNodes.update(req.params.id, req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

//////////////////////////////////////
//             BLOCKCHAIN
//////////////////////////////////////
// start a block chain 
router.post('/blockdb/db/:chainType/:className', async (req, res) => {
    try{
        if (!Object.values(BlockchainType).includes(req.params.chainType)){
            throw "unknown chain type"
        }
        const genChain = new blockchain.GenChain(req.params.className)
        const data = await genChain.insertOne(req.body, req.params.chainType)
        res.json(data)        
    }
    catch(error){
        res.status(500).json({message: error.message})
    }        
})

// get the notes 
router.get('/blockdb/db/:className/:id', async (req, res) => {
    try{
        const genChain = new blockchain.GenChain(req.params.className)
        const data = await genChain.findById(req.params.id)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }        
})

// add blocks to a chain
router.patch('/blockdb/db/:className/:id', async (req, res) => {
    try{
        const genChain = new blockchain.GenChain(req.params.className)
        const data = await genChain.update(req.params.id, req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }        
})

// delete a note from the notes list
router.delete('/blockdb/db/:className/:id/:docId', async (req, res) => {
    try{
        const genChain = new blockchain.GenChain(req.params.className)
        const data = genChain.delete(req.params.id, req.params.docId)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }        
})


//////////////////////////////////////
//             HOSTS NODES
//////////////////////////////////////
// get all hosts
router.get('/blockdb/hosts', async (req, res) => {
    try{        
        const data = await hostsNodes.findAll()
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// update a block
router.patch('/blockdb/hosts/:id', async (req, res) => {
    try{
        const data = await hostsNodes.update(req.params.id, req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

//////////////////////////////////////
//             READS/WRITES
//////////////////////////////////////
// get all blocks from the graph
router.get('/blockdb/stats/:hostname', async (req, res) => {
    try{        
        const reads = await hostsReadsCache.get(req.params.hostname)
        const writes = await hostsWritesCache.get(req.params.hostname)
        res.json({reads:reads?parseInt(reads):null, writes:writes?parseInt(writes):null})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// get ios from all hosts
router.get('/blockdb/stats', async (req, res) => {
    try{                
        // get all hosts
        const hosts = JSON.parse(process.env.BLOCKCHAIN_HOSTS).map(h => h.name)
        let ios = []
        for(var i=0;i<hosts.length;i++){
            const reads = await hostsReadsCache.get(hosts[i])
            const writes = await hostsWritesCache.get(hosts[i])
            ios.push({host:hosts[i], stats:{reads:(reads?parseInt(reads):null), writes:(writes?parseInt(writes):null)}})
        }
        
        res.json({data:ios})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})


module.exports = router;