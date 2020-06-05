require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const {NODE_ENV} = require('./config');
const RosesService = require('./roses/roses-service')

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello, world!')
});

app.get('/roses', (req, res, next) => {
    const knexInstance = req.app.get('db')
    
    RosesService.getAllRoses(knexInstance)
        .then(roses => {
            res.json(roses)
        })
        .catch(next)
});

app.get('/roses/:rose_id', (req, res, next) => {
    const knexInstance = req.app.get('db');

    RosesService.getRoseById(knexInstance, req.params.rose_id)
        .then(rose => {
            res.json(rose)
        })
        .catch(next)
});

app.use(function errorHandler(error, req, res, next) {
    let response;

    if (NODE_ENV === 'production') {
        response = { error: {message: 'server error.'}};
    }
    else {
        console.error(error);
        response = {message: error.message, error};
    }
    res.status(500).json(response);
});

module.exports = app;