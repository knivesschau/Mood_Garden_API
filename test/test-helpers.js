const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign(
        {user_id: user.id}, 
        secret, 
        {
            subject: user.user_name,
            algorithm: 'HS256', 
        }
    )
    return `Bearer ${token}`
}

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('garden_users').insert(preppedUsers)
        .then(() => {
            db.raw(
                `SELECT setval('garden_users_id_seq), ?)`,
                [users[users.length - 1].id]
            )
        })
}

module.exports = {
    makeAuthHeader,
    seedUsers
}