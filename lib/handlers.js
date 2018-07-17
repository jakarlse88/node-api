/*
 * Request handlers master logic.
 * 
 */

// Dependencies
const _users = require('./handlers/_users');
const _tokens = require('./handlers/_tokens');

// Define handlers
const handlers = {};

// Ping handler
handlers.ping = (data, callback) => {
    callback(200);
}

// Not found handler
handlers.notFound = (data, callback) => {
    callback(404);
};

// Users handler
handlers.users = (data, callback) => {
    const acceptableMethods = [
        'post',
        'get',
        'put',
        'delete'
    ];

    if (acceptableMethods.indexOf(data.method) > -1) {
        _users[data.method](data, callback);
    } else {
        callback(405);
    };
};

// Tokens handler
handlers.tokens = (data, callback) => {
    const acceptableMethods = [
        'post',
        'get',
        'put',
        'delete'
    ];

    if (acceptableMethods.indexOf(data.method) > -1) {
        _tokens[data.method](data, callback);
    } else {
        callback(405);
    };
};

// Export the module
module.exports = handlers;