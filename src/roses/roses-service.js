const config = '../config';
const jwt = require('jsonwebtoken');
const AuthService = require('../auth/auth-service');

const RosesService = {
    getAllRoses(knex, author_id)
    {
        console.log('string test 1', author_id)
        return knex
            .select('*')
            .from('rose_entries')
            .where({author_id: author_id}) 
    },
    getRoseById(knex, id) 
    {
        return knex
            .from('rose_entries')
            .select('*')
            .where('id', id)
            .first();
    },
    insertRose(knex, newRose) {
        return knex
            .insert(newRose)
            .into('rose_entries')
            .returning('*')
            .then(rows => {
                return rows[0]
            });
    },
    deleteRose(knex, id) {
        return knex('rose_entries')
            .where({id})
            .delete()
    },
    updateRose(knex, id, newEntryFields) {
        return knex('rose_entries')
            .where({id})
            .update(newEntryFields)
    }

}

module.exports = RosesService;