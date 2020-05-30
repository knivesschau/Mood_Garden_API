const app = require('../src/app')

describe('App', () => {
  it('GET /api responds with 200 containing "Hello, world!"', () => {
    return supertest(app)
      .get('/')
      .expect(200, 'Hello, world!')
  })
})