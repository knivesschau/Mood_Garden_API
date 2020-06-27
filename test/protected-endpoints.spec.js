const {expect} = require('chai');
const knex = require('knex');
const app = require('../src/app');
const {makeRosesArray} = require('./rose.fixtures');
const {makeUsersArray} = require('./users.fixtures');
const {makeAuthHeader} = require('./test-helpers');
const supertest = require('supertest');

describe('Protected Endpoints', function() {
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

    before('clean the first table', () => db('rose_entries').truncate());

    before('clean the second table', () => db('garden_users').delete());

    afterEach('cleanup first table', () => db('rose_entries').truncate());

    afterEach('cleanup second table', () => db('garden_users').delete());

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
        describe(endpoint.name, () => {
            it ('Responds 401 `Missing basic token` when no basic token', () => {
                return endpoint.method(endpoint.path)
                    .expect(401, {error: `Missing basic token`})
            })

            it ('Responds 401 `Unauthorized request` when no credentials in token', () => {
                const unauthCreds = {user_name: '', password: ''}
                return endpoint.method(endpoint.path)
                    .set('Authorization', makeAuthHeader(unauthCreds))
                    .expect(401, {error: `Unauthorized request`})
            })

            it ('Responds with 401 `Unauthorized request` when invalid user is provided', () => {
                const userInvalidName = {user_name: 'fake-user', password: 'fake101'}
                return supertest(app)
                    .get(`/api/roses/1`)
                    .set('Authorization', makeAuthHeader(userInvalidName))
                    .expect(401, {error: `Unauthorized request`})
            })

            it ('Responds with 401 `Unauthorized request` when invalid password is provided', () => {
                const userInvalidPass = {user_name: testUsers[0], password: 'incorrectpass'}
                return supertest(app)
                    .get(`/api/roses/1`)
                    .set('Authorization', makeAuthHeader(userInvalidPass))
                    .expect(401, {error: `Unauthorized request`})
            })
        })
    })
})
