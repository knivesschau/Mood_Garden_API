const {expect} = require('chai');
const knex = require('knex');
const app = require('../src/app');
const RosesService = require('../src/roses/roses-service');

describe.only('Roses Endpoints', function() {
    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        });
        app.set('db', db)
    });

    after('disconnect from db', () => db.destroy());

    before('clean the table', () => db('rose_entries').truncate());

    afterEach('cleanup', () => db('rose_entries').truncate());

    context('Given there are rose entries in the database', () => {
        const testRoses = [
            {
                id: 1,
                entry_date: '2020-01-22T16:28:32.615Z',
                rose: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                thorn: 'Velit laoreet id donec ultrices tincidunt.',
                bud: 'Sed nisi lacus sed viverra tellus.',
                color: 'Red'
            },
            {
                id: 2,
                entry_date: '2020-03-13T16:28:32.615Z',
                rose: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                thorn: 'Velit laoreet id donec ultrices tincidunt',
                bud: 'Sed nisi lacus sed viverra tellus.',
                color: 'Pink'
            },
            {
                id: 3,
                entry_date: '2020-04-13T16:28:32.615Z', 
                rose: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                thorn: 'Velit laoreet id donec ultrices tincidunt',
                bud: 'Sed nisi lacus sed viverra tellus.',
                color: 'Yellow'
            }
        ];

        beforeEach('insert rose entries', () => {
            return db
                .into('rose_entries')
                .insert(testRoses)
        });

        it (`GET /roses responds 200 and with all entries`, () => {
            return supertest(app)
                .get('/roses')
                .expect(200, testRoses)
        });

        it (`GET /roses/:rose_id responds with 200 and the specific entry`, () => {
            const entryId = 2;
            const expectedEntry = testRoses[entryId - 1];

            return supertest(app)
                .get(`/roses/${entryId}`)
                .expect(200, expectedEntry)
        });
    })
})