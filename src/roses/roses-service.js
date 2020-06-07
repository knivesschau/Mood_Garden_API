const RosesService = {
    getAllRoses(knex)
    {
        return knex.select('*').from('rose_entries')
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

}

module.exports = RosesService;