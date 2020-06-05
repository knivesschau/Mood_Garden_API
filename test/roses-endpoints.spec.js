const {expect} = require('chai');
const knex = require('knex');
const app = require('../src/app');
const RosesService = require('../src/roses/roses-service');
const {makeRosesArray} = require('./rose.fixtures');

describe('Roses Endpoints', function() {
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

    
    describe(`GET /roses`, () => {
        context('Given there are journal entries in the database', () => {
            const testRoses = makeRosesArray();
            
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
        });
    })
        
    describe(`GET /roses/:rose_id`, () => {
        context('Given there are journal entries in the database', () => {
            const testRoses = makeRosesArray();
            
            beforeEach('insert rose entries', () => {
                return db
                .into('rose_entries')
                .insert(testRoses)
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
})