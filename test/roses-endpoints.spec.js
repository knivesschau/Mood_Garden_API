const {expect} = require('chai');
const knex = require('knex');
const app = require('../src/app');
const {makeRosesArray} = require('./rose.fixtures');
const {makeUsersArray} = require('./users.fixtures');
const helpers = require('./test-helpers');
const { before } = require('mocha');

describe ('Roses Endpoints', function() {
    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL
        });
        app.set('db', db)
    });

    after('disconnect from db', () => db.destroy());

    before('clean the first table', () => db('rose_entries').truncate());

    before('clean the second table', () => db('garden_users').delete());

    afterEach('cleanup first table', () => db('rose_entries').truncate());

    afterEach('cleanup second table', () => db('garden_users').delete());

    describe (`GET /api/roses`, () => {
        context('Given no journal entries in the database', () => {
            const testUsers = makeUsersArray();
                    
            beforeEach('insert test users', () => {
                helpers.seedUsers(db, testUsers)
            })
            
            it ('Reponds with 200 and no journal entries', () => {
                return supertest(app)
                    .get('/api/roses')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, [])
            })
        })
        
        context ('Given there are journal entries in the database', () => {
            const testRoses = makeRosesArray();
            const testUsers = makeUsersArray();
                    
            beforeEach('insert test users', () => {
                helpers.seedUsers(db, testUsers)
            })
            
            beforeEach('insert journal entries', () => {
                return db
                .into('rose_entries')
                .insert(testRoses)
            });
            
            
            it ('GET /roses responds 200 and with all entries', () => {
                return supertest(app)
                .get('/api/roses')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200, testRoses)
            });
        })
    })
        
    describe (`GET /api/roses/:rose_id`, () => {
        context ('Given there are no journal entries in the database', () => {
            const testUsers = makeUsersArray();
                    
            beforeEach('insert test users', () => {
                helpers.seedUsers(db, testUsers)
            })

            beforeEach('insert journal entries', () => {
                return db
                .into('rose_entries')
            })
         
            it ('Responds with 404', () => {
                const articleId = 2468; 

                return supertest(app)
                    .get(`/api/roses/${articleId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {error: {message: `Journal entry does not exist.`}})
            })
        })
        
        context ('Given there are journal entries in the database', () => {
            const testRoses = makeRosesArray();
            const testUsers = makeUsersArray();
                    
            beforeEach('insert test users', () => {
                helpers.seedUsers(db, testUsers)
            })
            
            beforeEach('insert journal entries', () => {
                return db
                .into('rose_entries')
                .insert(testRoses)
            })


            it ('GET /roses/:rose_id responds with 200', () => {
                const entryId = 2;
                const expectedEntry = testRoses[entryId - 1];

                return supertest(app)
                .get(`/api/roses/${entryId}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
                .expect(200, expectedEntry)
            });
        });

        context ('Given an XSS attack journal entry', () => {
            const maliciousEntry = {
                id: 411,
                rose: 'Test rose entry BAD CODE <script>alert("xss");</script>',
                bud: 'Test bud entry BAD CODE <script>alert("xss");</script>',
                thorn: `Test thorn entry BAD IMG "https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);"&gt`,
                color: "Pink",
                author_id: 1
            };

            const testUsers = makeUsersArray();
                    
            beforeEach('insert test users', () => {
                helpers.seedUsers(db, testUsers)
            })
            
            beforeEach('insert xss journal entry', () => {
                return db
                    .into('rose_entries')
                    .insert([maliciousEntry])
            })

            it ('Removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/roses/${maliciousEntry.id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200)
                    .expect(res => {
                        expect(res.body.rose).to.eql('Test rose entry BAD CODE &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                        expect(res.body.bud).to.eql('Test bud entry BAD CODE &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                        expect(res.body.thorn).to.eql(`Test thorn entry BAD IMG "https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);"&gt`)
                    })
            })

        });
    });

    describe (`POST /api/roses`, () => {
        this.retries(3);

        const testUsers = makeUsersArray();

        beforeEach('insert test users', () => {
            helpers.seedUsers(db, testUsers)
        })

        beforeEach('insert journal entries', () => {
            return db
            .into('rose_entries')
        })

        const newRose = {
            rose: 'Test rose entry',
            thorn: 'Test thorn entry',
            bud: 'Test bud entry',
            color: 'Purple',
        };
        
        it ('Creates a journal entry, responds 201 and with the entry created', () => {
            return supertest(app)
                .post('/api/roses')
                .send(newRose)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0])) 
                .expect(201)
                .expect(res => {
                    expect(res.body.rose).to.eql(newRose.rose)
                    expect(res.body.thorn).to.eql(newRose.thorn)
                    expect(res.body.bud).to.eql(newRose.bud)
                    expect(res.body.color).to.eql(newRose.color)
                    expect(res.body).to.have.property('id')
                    expect(res.author_id).to.eql(testUsers.id)
                    expect(res.headers.location).to.eql(`/api/roses/${res.body.id}`)

                    const expected = new Date().toLocaleString();
                    const actual = new Date(res.body.entry_date).toLocaleString();

                    expect(actual).to.eql(expected)
                })
                .then(postRes => {
                    supertest(app)
                        .get(`/api/roses/${postRes.body.id}`)
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
                    .post('/api/roses')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0])) 
                    .send(newRose)
                    .expect(400, {
                        error: { message: `Missing '${field}' entry in request body.`}
                    })
            });
        });

    });

    describe (`DELETE /api/roses/:rose_id`, () => {

        context('Given there are no journal entries in the database', () => {
            const testUsers = makeUsersArray();
                    
            beforeEach('insert test users', () => {
                helpers.seedUsers(db, testUsers)
            })

            beforeEach('insert journal entries', () => {
                return db
                .into('rose_entries')
            })
            
            it ('Responds with 404', () => {
                const roseId = 12456;

                return supertest(app)
                    .delete(`/api/roses/${roseId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, { error: {message: `Journal entry does not exist.`}})
            });
        });
        
        context('Given there are journal entries in the database', () => {
            const testRoses = makeRosesArray();
            const testUsers = makeUsersArray();
                    
            beforeEach('insert test users', () => {
                helpers.seedUsers(db, testUsers)
            })
            
            beforeEach('insert journal entries', () => {
                return db
                .into('rose_entries')
                .insert(testRoses)
            })

            it ('Responds with 204 and removes the journal entry', () => {
                const idToRemove = 3; 

                const expectedEntries = testRoses.filter(rose => rose.id !== idToRemove);

                return supertest(app)
                    .delete(`/api/roses/${idToRemove}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get('/roses')
                            .expect(expectedEntries)
                    });
            });
        });
    });

    describe (`PATCH /api/roses/:rose_id`, () => {
        
        context('Given no journal entries', () => {
            const testUsers = makeUsersArray();

            beforeEach('insert test users', () => {
                helpers.seedUsers(db, testUsers)
            })

            beforeEach('insert journal entries', () => {
                return db
                .into('rose_entries')
            })
            
            it ('Responds with 404', () => {
                const entryId = 23567; 

                return supertest(app)
                    .patch(`/api/roses/${entryId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0])) 
                    .expect(404, {
                        error: {message: `Journal entry does not exist.`}
                    })
            });
        });

        context('Given there are journal entries in the database', () => {
            const testRoses = makeRosesArray();
            const testUsers = makeUsersArray();
                    
            beforeEach('insert test users', () => {
                helpers.seedUsers(db, testUsers)
            })
            
            beforeEach('insert journal entries', () => {
                return db
                .into('rose_entries')
                .insert(testRoses)
            })

            it ('Responds with 204 and updates the journal entry', () => {
                const idToUpdate = 2;

                const updateEntry = {
                    rose: 'Updated rose content',
                    thorn: 'Updated thorn content',
                    bud: 'Updated bud content'
                }

                const expectedEntry = {
                    ...testRoses[idToUpdate - 1],
                    ...updateEntry
                };

                return supertest(app)
                    .patch(`/api/roses/${idToUpdate}`)
                    .send(updateEntry)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0])) 
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/roses/${idToUpdate}`)
                            .expect(expectedEntry)
                    })
            });

            it ('Responds with 400 when no required fields are sent', () => {
                const idToUpdate = 2; 

                return supertest(app)
                    .patch(`/api/roses/${idToUpdate}`)
                    .send({unrelatedField: 'bar'})
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0])) 
                    .expect(400, {
                        error: {
                            message: `Request body must contain either 'rose', 'thorn', or 'bud'.`
                        }
                    })
            });

            it ('Responds with 204 when updating only a subset of fields', () => {
                const idToUpdate = 2; 

                const updateEntry = {
                    rose: 'Updated Rose content'
                }

                return supertest(app)
                    .patch(`/api/roses/${idToUpdate}`)
                    .send({
                        ...updateEntry,
                        ignoreRoseColor: 'Red'
                    })
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0])) 
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/roses/${idToUpdate}`)
                            .expect(updateEntry)
                    })
            });
        });
    });

});