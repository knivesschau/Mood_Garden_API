function makeAuthHeader(user) {
    const token = Buffer.from(`${user.user_name}:${user.password}`).toString('base64')
    return `Basic ${token}`
}

module.exports = {
    makeAuthHeader
}