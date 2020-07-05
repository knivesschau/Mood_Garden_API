const path = require('path');
const express = require('express');
const xss = require('xss');
const RosesService = require('./roses-service');
const {requireAuth} = require('../middleware/basic-auth');

const rosesRouter = express.Router();
const jsonParser = express.json();

const serializeJournalEntry = rose => ({
    id: rose.id,
    entry_date: rose.entry_date,
    rose: xss(rose.rose),
    thorn: xss(rose.thorn),
    bud: xss(rose.bud),
    color: xss(rose.color),
    author_id: rose.author_id
});

rosesRouter 
    .route('/')
    .all(requireAuth)
    .get((req,res, next) => {
        RosesService.getAllRoses(
            req.app.get('db')
        )
        .then(roses => {
            res.json(roses)
        })
        .catch(next)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const {rose, thorn, bud, color} = req.body;
        const newRose = {rose, thorn, bud, color};

        for (const [key, value] of Object.entries(newRose)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' entry in request body.`}
                })
            }
        }

        newRose.author_id = req.user.id;

        RosesService.insertRose(
            req.app.get('db'),
            newRose
        )
        .then(rose => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${rose.id}`))
                .json(rose)
        })
        .catch(next)
    });

rosesRouter
    .route('/:rose_id')
    .all(requireAuth)
    .all((req, res, next) => {
        RosesService.getRoseById(
            req.app.get('db'),
            req.params.rose_id
        )
            .then(rose => {
                if (!rose) {
                    return res.status(404).json({
                        error: {message: `Journal entry does not exist.`}
                    });
                }
                res.rose = rose;
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
       res.json(serializeJournalEntry(res.rose))
    })
    .delete((req, res, next) => {
        RosesService.deleteRose(
            req.app.get('db'),
            req.params.rose_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const {rose, thorn, bud} = req.body;
        const entryToUpdate = {rose, thorn, bud};

        const numberOfValues = Object.values(entryToUpdate).filter(Boolean).length;

        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'rose', 'thorn', or 'bud'.`
                }
            });
        }

        RosesService.updateRose(
            req.app.get('db'),
            req.params.rose_id,
            entryToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    });

module.exports = rosesRouter;