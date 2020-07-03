const AuthService = {
    getRegisteredUser(db, user_name) {
        return db('garden_users')
            .where({user_name})
            .first()
    },
    parseBasicToken(token) {
        return Buffer
            .from(token, 'base64')
            .toString()
            .split(':')
    },
}

module.exports = AuthService;