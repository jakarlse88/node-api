/*
 * Request handlers master logic.
 * 
 */

// Dependencies
const _users = require('./handlers/_users');
const _tokens = require('./handlers/_tokens');
const _checks = require('./handlers/_checks');

// Define handlers
const handlers = {};

// Ping handler
handlers.ping = (data, cb) => {
    cb(200);  
}

// Not found handler
handlers.notFound = (data, cb) => {
    cb(404);
};

// Users handler
handlers.users = (data, cb) => {
    const acceptableMethods = [
        'post',
        'get',
        'put',
        'delete'
    ];

    if (acceptableMethods.indexOf(data.method) > -1) {
        _users[data.method](data, cb);
    } else {
        cb(405);
    };
};

// Tokens handler
handlers.tokens = (data, cb) => {
    const acceptableMethods = [
        'post',
        'get',
        'put',
        'delete'
    ];

    if (acceptableMethods.indexOf(data.method) > -1) {
        _tokens[data.method](data, cb);
    } else {
        cb(405);
    };
};

// Checks handler
handlers.checks = (data, cb) => {
    const acceptableMethods = [
        'post',
        'get',
        'put', 
        'delete'
    ];

    if (acceptableMethods.indexOf(data.method) > -1) {
        _checks[data.method](data, cb);
    } else {
        cb(405);
    };
};

// Export the module
module.exports = handlers;