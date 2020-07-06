const knex = require('knex');
const app = require('../src/app');
const {makeRosesArray} = require('./rose.fixtures');
const {makeUsersArray} = require('./users.fixtures');
const helpers = require('./test-helpers');
const supertest = require('supertest');

describe ('Protected Endpoints', function() {
    let db; 

    const testRoses = makeRosesArray();
    const testUsers = makeUsersArray();

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    });

    after('disconnect from db', () => db.destroy());

    before('clean the second table', () => db('garden_users').delete());

    before('clean the first table', () => db('rose_entries').truncate());

    afterEach('cleanup second table', () => db('garden_users').delete());

    afterEach('cleanup first table', () => db('rose_entries').truncate());

    beforeEach('insert test users', () => {
        return db
        .into('garden_users')
        .insert(testUsers)
    });

    beforeEach('insert journal entries', () => {
        return db
        .into('rose_entries')
        .insert(testRoses)
    });

    const protectedEndpoints = [
        {
            name: `GET /api/roses`,
            path: '/api/roses/',
            method: supertest(app).get,
        },
        {
            name: `GET /api/roses/:rose_id`,
            path: '/api/roses/1',
            method: supertest(app).get,
        },
        {
            name: `POST /api/roses`,
            path: '/api/roses/',
            method: supertest(app).post
        }
    ];

    protectedEndpoints.forEach(endpoint => {
        describe (endpoint.name, () => {
            it ('Responds 401 `Missing bearer token` when no bearer token', () => {
                return endpoint.method(endpoint.path)
                    .expect(401, {error: `Missing bearer token`})
            })

            it ('Responds 401 `Unauthorized request` when invalid JWT secret', () => {
                const validUser = testUsers[0];
                const invalidSecret = 'bad-secret';

                return endpoint.method(endpoint.path)
                    .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
                    .expect(401, {error: `Unauthorized request`})
            })

            it ('Responds with 401 `Unauthorized request` when invalid sub in payload', () => {
                const invalidUser = {user_name: 'fake-user', id: 1}

                return endpoint.method(endpoint.path)
                    .set('Authorization', helpers.makeAuthHeader(invalidUser))
                    .expect(401, {error: `Unauthorized request`})
            })
        })
    })
})
