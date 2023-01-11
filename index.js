require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const routes = require('./src/routes/routes');

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
    console.log('Database Connected');
})

// server instance
const app = express();
app.use(express.json());

// routes
app.use('/api', routes)

// server execution
app.listen(3000, () => {
    console.log(`Server Started at ${3000}`)
})