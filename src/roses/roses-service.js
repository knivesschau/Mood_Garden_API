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

}

module.exports = RosesService;