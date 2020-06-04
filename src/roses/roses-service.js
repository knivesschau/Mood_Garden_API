const RosesService = {
    getAllRoses(knex)
    {
        return knex.select('*').from('rose_entries')
    },

}

module.exports = RosesService;