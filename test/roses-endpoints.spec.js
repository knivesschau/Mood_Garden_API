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
        context('Given no journal entries in the database', () => {
            it (`reponds with 200 and no journal entries`, () => {
                return supertest(app)
                    .get('/roses')
                    .expect(200, [])
            });
        });
        
        context ('Given there are journal entries in the database', () => {
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
        context ('Given there are no journal entries in the database', () => {
            it ('Responds with 404', () => {
                const articleId = 2468; 

                return supertest(app)
                    .get(`/roses/${articleId}`)
                    .expect(404, {error: {message: `Journal entry does not exist.`}})
            });
        });
        
        context ('Given there are journal entries in the database', () => {
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
        });
    });

    describe(`POST /roses`, () => {
        this.retries(3);
        
        const newRose = {
            rose: 'Test rose entry',
            thorn: 'Test thorn entry',
            bud: 'Test bud entry',
            color: 'Purple'
        };
        
        it (`Creats a journal entry, responds 201 and with the entry created`, () => {
            return supertest(app)
                .post('/roses')
                .send(newRose) 
                .expect(201)
                .expect(res => {
                    expect(res.body.rose).to.eql(newRose.rose)
                    expect(res.body.thorn).to.eql(newRose.thorn)
                    expect(res.body.bud).to.eql(newRose.bud)
                    expect(res.body.color).to.eql(newRose.color)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/roses/${res.body.id}`)

                    const expected = new Date().toLocaleString();
                    const actual = new Date(res.body.entry_date).toLocaleString();

                    expect(actual).to.eql(expected)
                })
                .then(postRes => {
                    supertest(app)
                        .get(`/roses/${postRes.body.id}`)
                        .expect(postRes.body)
                });
        });
    });




});