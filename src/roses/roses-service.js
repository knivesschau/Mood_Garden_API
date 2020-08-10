// service object to handle database queries to GET, POST, PATCH, or DELETE journal entries. //
const RosesService = {
    getAllRoses(knex, author_id)
    {
        return knex
            .select('*')
            .from('rose_entries')
            .where({author_id: author_id});
    },
    getRoseById(knex, id, author_id) 
    {
        return knex
            .from('rose_entries')
            .select('*')
            .where(
                {id: id},
                {author_id: author_id},
                )
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
            .delete();
    },
    updateRose(knex, id, newEntryFields) {
        return knex('rose_entries')
            .where({id})
            .update(newEntryFields);
    }
};

module.exports = RosesService;