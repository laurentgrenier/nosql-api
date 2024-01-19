require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const routes = require('./src/routes/routes');
const path = require('path');

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
const app = express();
app.use(express.json());

// routes
app.use('/api', routes)
app.use(express.static(path.join(__dirname, 'public')));

// socket
/*const server = require('http').createServer();
const io = require('socket.io')(server, {

  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
io.on('connection', client => {
    client.emit("hello", "world");
  client.on('event', data => { console.debug(data) });
  client.on('disconnect', () => { console.debug("disconnect") });
});
server.listen(3001);*/


// server execution
app.listen(3000, () => {
    console.log(`NoSQL API started at ${3000}`)
})

process.on('SIGINT',function () {    
    process.exit()
})
  
