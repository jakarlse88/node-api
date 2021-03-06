/*
 * API tests
 *
 */

// Dependencies
const app = require('../index');
const assert = require('assert');
const http = require('http');
const config = require('../lib/config');

// Container
const api = {};

// Helpers
const helpers = {};

helpers.makeGetRequest = (path, cb) => {
    // Configure request details
    const requestDetails = {
        'protocol': 'http:',
        'hostname': 'localhost',
        'port': config.httpPort,
        'method': 'GET',
        'path': path,
        'headers': {
            'Content-Type': 'application/json'
        }
    };

    // Send the request
    const req = http.request(requestDetails, res => {
        cb(res);
    });

    req.end();
};

api['/ping should respond to GET with 200'] = done => {
    helpers.makeGetRequest('/ping', res => {
        assert.equal(res.statusCode, 200);
        done();
    });
};

api['/users should respond to GET with 400'] = done => {
    helpers.makeGetRequest('/users', res => {
        assert.equal(res.statusCode, 400);
        done();
    });
};

api['A random path should respond to GET with 404'] = done => {
    helpers.makeGetRequest('/this/path/should/not/exist', res => {
        assert.equal(res.statusCode, 404);
        done();
    });
};
// The main init() function should be able to run without throwing
api['app.init should start without throwing'] = done => {
    assert.doesNotThrow(() => {
        app.init(err => done())}, TypeError);
};

// Export
module.exports = api;