require('dotenv').config();


const express = require('express');
const httpd = express()
const mongoose = require('mongoose');
//const routes = require('./src/routes/__routes');
const path = require('path');
const server = require('http').createServer(httpd);
const morgan = require('morgan')

// mongo settings
const mongoString = process.env.MONGO_URI;
mongoose.set('strictQuery', false);


// mongo db connection
mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('MongoDB database connected');
})

// server instance
//const app = express();
//app.use(express.json());
httpd.use(express.json());
httpd.use(express.static(path.join(__dirname, 'public')));

// cache
const cache = require('./src/databases/redis/models')

// dal
const graph = require('./src/databases/neo4j/models')
const blockchain = require('./src/databases/blockchain/models')

// socket
const socket = require("./src/services/socket.js")(server, cache)

// logger
const logger = require("./src/services/logger")
httpd.use(morgan('combined', { stream: logger.stream }))

// initialize services
const services = new (require('./src/services/service_factory.js'))(logger, {graph:graph, blockchain:blockchain, cache:cache}, socket, null)

// initialize crons
const crons = new (require("./src/crons/cron_factory.js"))(logger, services)

// routes
//app.use('/api', routes)
//app.use(express.static(path.join(__dirname, 'public')));
//httpd.use('/api', routes)

// initialize routes
const routes = new (require('./src/routes/route_factory.js'))(logger, services)
httpd.use(routes.blocks.root, routes.blocks.router)
httpd.use(routes.users.root, routes.users.router)


// server execution 
/*
app.listen(3000, () => {
    console.log(`NoSQL API started at ${3000}`)
})

process.on('SIGINT',function () {    
    process.exit()
})
  
*/
// set timeout 
server.keepAliveTimeout = 60000;
  
// Fire up server
const app = server.listen(process.env.HTTP_PORT, function () {
  logger.info('Agenda sas api listening on: http://localhost:' + process.env.HTTP_PORT)
})

// Properly close everything on shutdown
process.on('SIGINT',function () {
  socket.close()
  server.close()

  // stop all crons
  Object.keys(crons).forEach(cron => {
    crons[cron].destroy()
  })
  
  process.exit()
})