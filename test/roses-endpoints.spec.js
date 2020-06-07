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
            it ('Reponds with 200 and no journal entries', () => {
                return supertest(app)
                    .get('/roses')
                    .expect(200, [])
            });
        });
        
        context ('Given there are journal entries in the database', () => {
            const testRoses = makeRosesArray();
            
            beforeEach('insert journal entries', () => {
                return db
                .into('rose_entries')
                .insert(testRoses)
            });
            
            it ('GET /roses responds 200 and with all entries', () => {
                return supertest(app)
                .get('/roses')
                .expect(200, testRoses)
            });
        });
    });
        
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
            
            beforeEach('insert journal entries', () => {
                return db
                .into('rose_entries')
                .insert(testRoses)
            });
            
            it ('GET /roses/:rose_id responds with 200 and the specific entry', () => {
                const entryId = 2;
                const expectedEntry = testRoses[entryId - 1];
                
                return supertest(app)
                .get(`/roses/${entryId}`)
                .expect(200, expectedEntry)
            });
        });

        context ('Given an XSS attack journal entry', () => {
            const maliciousEntry = {
                id: 411,
                rose: 'Test rose entry BAD CODE <script>alert("xss");</script>',
                bud: 'Test bud entry BAD CODE <script>alert("xss");</script>',
                thorn: `Test thorn entry BAD IMG "https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);"&gt`,
                color: "Pink"
            };

            beforeEach('insert xss journal entry', () => {
                return db
                    .into('rose_entries')
                    .insert([maliciousEntry])
            })

            it ('Removes XSS attack content', () => {
                return supertest(app)
                    .get(`/roses/${maliciousEntry.id}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.rose).to.eql('Test rose entry BAD CODE &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                        expect(res.body.bud).to.eql('Test bud entry BAD CODE &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                        expect(res.body.thorn).to.eql(`Test thorn entry BAD IMG "https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);"&gt`)
                    })
            })

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
        
        it ('Creates a journal entry, responds 201 and with the entry created', () => {
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

        const requiredFields = ['rose', 'thorn', 'bud', 'color'];

        requiredFields.forEach(field => {
            const newRose = {
                rose: 'Test rose',
                thorn: 'Test thorn',
                bud: 'Test bud',
                color: 'Red'
            }

            it (`Responds with 400 and an error message when the ${field} is missing'`, () => {
                delete newRose[field]

                return supertest(app)
                    .post('/roses')
                    .send(newRose)
                    .expect(400, {
                        error: { message: `Missing '${field}' entry in request body.`}
                    })
            });
        });

    });

    describe(`DELETE /roses/:rose_id`, () => {
        context('Given there are no journal entries in the database', () => {
            it ('Responds with 404', () => {
                const roseId = 12456;

                return supertest(app)
                    .delete(`/roses/${roseId}`)
                    .expect(404, { error: {message: `Journal entry does not exist.`}})
            });
        });
        
        context('Given there are journal entries in the database', () => {
            const testRoses = makeRosesArray();

            beforeEach('insert journal entries', () => {
                return db
                    .into('rose_entries')
                    .insert(testRoses)
            });

            it ('Responds with 204 and removes the journal entry', () => {
                const idToRemove = 3; 

                const expectedEntries = testRoses.filter(rose => rose.id !== idToRemove);

                return supertest(app)
                    .delete(`/roses/${idToRemove}`)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get('/roses')
                            .expect(expectedEntries)
                    });
            });
        });
    });

});