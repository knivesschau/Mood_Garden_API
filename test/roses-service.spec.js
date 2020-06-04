const {expect} = require('chai');
const knex = require('knex');
const app = require('../src/app');
const RosesService = require('../src/roses/roses-service');

describe.only('Roses Service Object', function() {
    let db;

    let testRoses = [
        {
            id: '1',
            entry_date: new Date('2020-04-20T16:28:32:615Z'), 
            rose: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            thorn: 'Velit laoreet id donec ultrices tincidunt.',
            bud: 'Sed nisi lacus sed viverra tellus.',
            color: 'Red'
        },
        {
            id: '2',
            entry_date: new Date('2020-03-15T16:28:32.615Z'),
            rose: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            thorn: 'Velit laoreet id donec ultrices tincidunt',
            bud: 'Sed nisi lacus sed viverra tellus.',
            color: 'Pink'
        },
        {
            id: '3',
            entry_date: new Date('2020-02-14T16:28:32.615Z'),
            rose: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            thorn: 'Velit laoreet id donec ultrices tincidunt',
            bud: 'Sed nisi lacus sed viverra tellus.',
            color: 'Yellow'
        }
    ];
})