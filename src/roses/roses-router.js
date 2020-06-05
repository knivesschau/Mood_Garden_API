const path = require('path');
const express = require('express');
const xss = require('xss');
const RosesService = require('./roses-service');

const rosesRouter = express.Router();
const jsonParser = express.json();

rosesRouter 
    .route('/')
    .get( (req,res, next) => {
        RosesService.getAllRoses(
            req.app.get('db')
        )
        .then(roses => {
            res.json(roses)
        })
        .catch(next)
    })

rosesRouter
    .route('/:rose_id')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')

        RosesService.getRoseById(knexInstance, req.params.rose_id)
            .then(rose => {
                if (!rose) {
                    return res.status(404).json({
                        error: {message: `Entry does not exist.`}
                    })
                }
                res.json(rose)
            })
            .catch(next)
    })

module.exports = rosesRouter;