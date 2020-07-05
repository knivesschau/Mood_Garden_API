const bcrypt = require('bcryptjs');

function makeAuthHeader(user) {
    const token = Buffer.from(`${user.user_name}:${user.password}`).toString('base64')
    return `Basic ${token}`
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