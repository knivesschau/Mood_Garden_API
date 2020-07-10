const app = require('../src/app')

describe('App', () => {
  it('GET /api responds with 200 containing "Welcome to the Mood Garden API!"', () => {
    return supertest(app)
      .get('/')
      .expect(200, 'Welcome to the Mood Garden API!')
  })
})