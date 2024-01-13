const express = require('express');
const router = express.Router()
const models = require('../databases/mongo/models')
const caches = require('../databases/redis/models')
const graph = require('../databases/neo4j/models')
const blockchain = require('../databases/blockchain/models')


// import models 
const plagues = new models.Plagues()
const doctors = new models.Doctors()

// import caches 
const usersCache = new caches.UsersCache()
const instantsPublisher = new caches.InstantsPublisher()

// import graphs
const articlesNode = new graph.ArticlesNode()
const editorsNode = new graph.EditorsNode()
const writesRelation = new graph.WritesRelation()

// import blockchain
const notesChain = new blockchain.NotesChain()


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
//             PLAGUES
//////////////////////////////////////
// get all plagues
router.get('/plagues', async (req, res) => {
    try{        
        const data = await plagues.findAll(req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// add a plague
router.post('/plagues', async (req, res) => {
    try{
        const data = await plagues.insertOne(req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// add multiple plagues
router.put('/plagues', async (req, res) => {
    try{
        const data = await plagues.insertMany(req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// update a plague 
router.patch('/plagues/:id', async (req, res) => {
    try{
        const data = await plagues.update(req.params.id, req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// delete a plague
router.delete('/plagues/:id', async (req, res) => {
    try{
        const data = await plagues.delete(req.params.id)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// get one plague
router.get('/plagues/:id', async (req, res) => {
    try{
        const data = await plagues.findById(req.params.id)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

//////////////////////////////////////
//             DOCTORS
//////////////////////////////////////
// add a doctor
router.post('/doctors', async (req, res) => {
    try{
        const data = await doctors.insertOne(req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// add many doctors
router.put('/doctors', async (req, res) => {
    try{
        const data = await doctors.insertMany(req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// update a doctor
router.patch('/doctors/:id', async (req, res) => {
    try{
        const data = await doctors.update(req.params.id, req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// delete a doctor
router.delete('/doctors/:id', async (req, res) => {
    try{
        const data = await doctors.delete(req.params.id)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// get all doctors
router.get('/doctors', async (req, res) => {
    try{
        const data = await doctors.findAll(req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// get one doctor
router.get('/doctors/:id', async (req, res) => {
    try{
        const data = await doctors.findById(req.params.id)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// get within perimeter doctors
router.get('/doctors/:id/within/:distance', async (req, res) => {
    try{
        // the doctor on which the perimeter is centered
        let doctor = await doctors.findById(req.params.id)
        // geo query
        const data = await doctors.within(doctor, req.params.distance)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// get within perimeter doctors
router.get('/doctors/:id/nearest/:count', async (req, res) => {
    try{
        // the doctor on which the perimeter is centered
        let doctor = await doctors.findById(req.params.id)
        // geo query
        const data = await doctors.nearest(doctor, req.params.count)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

//////////////////////////////////////
//             USERS
//////////////////////////////////////
// add an user
router.post('/users/:id', async (req, res) => {
    try{
        const data = await usersCache.set(req.params.id, req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// get an user
router.get('/users/:id', async (req, res) => {
    try{
        const data = JSON.parse(await usersCache.get(req.params.id))
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// delete an user
router.delete('/users/:id', async (req, res) => {
    try{
        const data = await usersCache.del(req.params.id)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// get all users
router.get('/users', async (req, res) => {
    try{
        const data = await usersCache.list()
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})


//////////////////////////////////////
//             INSTANTS
//////////////////////////////////////
// set an instant
router.post('/instants', async (req, res) => {
    try{
        const data = await instantsPublisher.set("*", req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// set an instant
router.post('/instants/:id', async (req, res) => {
    try{
        const data = await instantsPublisher.set(req.params.id, req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

//////////////////////////////////////
//             ARTCILES
//////////////////////////////////////
// get all articles from the graph
router.get('/nodes/articles', async (req, res) => {
    try{        
        const data = await articlesNode.findAll()
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// get an article
router.get('/nodes/articles/:id', async (req, res) => {
    try{
        const data = await articlesNode.findById(req.params.id)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// add an article
router.post('/nodes/articles', async (req, res) => {
    try{
        const data = await articlesNode.insertOne(req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// add multiple articles
router.put('/nodes/articles', async (req, res) => {
    try{
        const data = await articlesNode.insertMany(req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// delete an article
router.delete('/nodes/articles/:id', async (req, res) => {
    try{
        const data = await articlesNode.delete(req.params.id)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// update an article
router.patch('/nodes/articles/:id', async (req, res) => {
    try{
        const data = await articlesNode.update(req.params.id, req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})


//////////////////////////////////////
//             EDITORS
//////////////////////////////////////
// get all editors from the graph
router.get('/nodes/editors', async (req, res) => {
    try{        
        const data = await editorsNode.findAll()
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// get an editor
router.get('/nodes/editors/:id', async (req, res) => {
    try{
        const data = await editorsNode.findById(req.params.id)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// add an editor
router.post('/nodes/editors', async (req, res) => {
    try{
        const data = await editorsNode.insertOne(req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// add multiple editors
router.put('/nodes/editors', async (req, res) => {
    try{
        const data = await editorsNode.insertMany(req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// delete an editor
router.delete('/nodes/editors/:id', async (req, res) => {
    try{
        const data = await editorsNode.delete(req.params.id)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// update an editor
router.patch('/nodes/editors/:id', async (req, res) => {
    try{
        const data = await editorsNode.update(req.params.id, req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

//////////////////////////////////////
//             WRITES
//////////////////////////////////////
// get all writes relations from the graph
router.get('/relations/writes', async (req, res) => {
    try{        
        const data = await writesRelation.findAll()
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// add a write relation
router.post('/relations/writes/:fromNodeId/:toNodeId', async (req, res) => {
    try{
        const data = await writesRelation.insertOne(req.params.fromNodeId, req.params.toNodeId, req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// get a write relation
router.get('/relations/writes/:id', async (req, res) => {
    try{
        const data = await writesRelation.findById(req.params.id)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// delete a write relation
router.delete('/relations/writes/:id', async (req, res) => {
    try{
        const data = await writesRelation.delete(req.params.id)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

// update a write relation
router.patch('/relations/writes/:id', async (req, res) => {
    try{
        const data = await writesRelation.update(req.params.id, req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

//////////////////////////////////////
//             BLOCKCHAIN
//////////////////////////////////////
// add some notes 
router.post('/blockchain/notes', async (req, res) => {
    try{
        const data = notesChain.insertOne(req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }        
})

// get the notes 
router.get('/blockchain/notes/:id', async (req, res) => {
    try{
        const data = notesChain.findById(req.params.id)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }        
})

// add a note to the notes list
router.patch('/blockchain/notes/:id', async (req, res) => {
    try{
        const data = notesChain.update(req.params.id, req.body)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }        
})

// delete a note from the notes list
router.delete('/blockchain/notes/:id/note/:noteId', async (req, res) => {
    try{
        const data = notesChain.delete(req.params.id, req.params.noteId)
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }        
})

// 
router.get('/blockchain/test', async (req, res) => {
    try{
        const data = notesChain.test()
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }        
})



module.exports = router;