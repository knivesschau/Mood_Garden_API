const express = require('express');
const path = require('path');
const UsersService = require('./users-service');
const { hashSync } = require('bcryptjs');

const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter
    .post('/', jsonBodyParser, (req, res, next) => {
        const {password, user_name} = req.body;

        for (const field of ['user_name', 'password']) {
            if (!req.body[field]) {
                return res.status(400).json({error: `Missing '${field}' in request body.`})
            }
        }

        const passwordChecker = UsersService.validatePassword(password);

        if (passwordChecker) {
            return res.status(400).json({error: passwordChecker})
        }

        UsersService.hasDuplicateUser(
            req.app.get('db'),
            user_name
        )
            .then(hasDuplicateUser => {
                if (hasDuplicateUser) {
                    return res.status(400).json({error: `Username already taken.`})
                }
                
                return UsersService.hashPassword(password)
                    .then(hashedPassword => {
                        
                        const newUser = {
                            user_name,
                            password: hashedPassword,
                            date_created: 'now()'
                        }

                        return UsersService.insertNewUser(
                            req.app.get('db'),
                            newUser
                        )
                        .then(user => {
                            res
                                .status(201)
                                .location(path.posix.join(req.originalUrl, `/${user.id}`))
                                .json(UsersService.serializeUser(user))
                        })
                    })
            })
            .catch(next)
    })

module.exports = usersRouter;