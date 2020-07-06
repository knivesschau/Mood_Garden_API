const express = require('express');
const AuthService = require('./auth-service');

const authRouter = express.Router();
const jsonBodyParser = express.json(); 

authRouter
    .post('/login', jsonBodyParser, (req, res, next) => {
        const {user_name, password} = req.body;
        const loginCreds = {user_name, password}

        for (const [key, value] of Object.entries(loginCreds)) {
            if (value == null) {
                return res.status(400).json({error: `Missing ${key} in request body.`})
            }
        }

        AuthService.getRegisteredUser(
            req.app.get('db'),
            loginCreds.user_name
        )
            .then(dbUser => {
                if (!dbUser) {
                    return res.status(400).json({error: `Incorrect user_name or password.`})
                }
                return AuthService.comparePasswords(loginCreds.password, dbUser.password)
                    .then(compareMatch => {
                        if (!compareMatch) {
                            return res.status(400).json({error: `Incorrect user_name or password.`})
                        }
                        
                        const sub = dbUser.user_name;
                        const payload = {user_id: dbUser.id};

                        res.send({
                            authToken: AuthService.createJwt(sub, payload),
                        })
                    })
            })
            .catch(next)
    })


module.exports = authRouter;