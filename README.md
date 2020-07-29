# Mood Garden Capstone (API Server)

<a href="https://github.com/knivesschau/Mood_Garden">Mood Garden Client</a>
<br>
<a href="https://mood-garden.now.sh/">Live App (Client)</a> 
<br>
<a href="https://calm-coast-19093.herokuapp.com/">Heroku API Server</a>

This is the API Server for the Mood Garden App. Mood Garden is an app that allows you to learn, grow, and reflect on your life by cultivating a rose garden that acts as your daily mood journal. Plant roses, edit them, and revisit them anytime, anywhere.

## Technologies Used
- Node.JS
- Express
- PostgreSQL
- Knex
- Mocha
- Supertest

## API Endpoints
```
GET
  - /api/roses (All Entries by User Logged In)
  - /api/:rose_id 
```
```
POST, DELETE, AND PATCH
  - /api/:rose_id 
```
```
USERS AND AUTHENTICATION
  - /api/users (Registration)
  - /api/auth/login (Login)
```
