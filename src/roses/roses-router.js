const path = require('path');
const express = require('express');
const xss = require('xss');
const RosesService = require('./roses-service');

const rosesRouter = express.Router();
const jsonParser = express.json();

