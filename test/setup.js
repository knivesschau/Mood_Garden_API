require('dotenv').config();
const { expect } = require('chai');
const supertest = require('supertest');

global.expect = expect;
global.supertest = supertest;

process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRY = '3m';