/*
 * Tokens handle sub-methods.
 * 
 */

// Dependencies 
const _data = require('../data');
const _helpers = require('../_helpers');
const _utils = require('../utils');
const _performance = require('perf_hooks').performance;
const util = require('util');
const debug = util.debuglog('performance');

// Container for tokens sub-methods
const _tokens = {};

// Tokens--post
// Required data: phone, password
// Optional data: none
_tokens.post = (data, cb) => {
    _performance.mark('entered function');
    const phone = _helpers.validatePhoneNumber(data.payload.phone);

    const password = _helpers.validatePassword(data.payload.password);

    _performance.mark('inputs validated');

    if (phone && password) {
        _performance.mark('beginning user lookup');
        // Lookup the user who matches that phone
        _data.read('users', phone, (err, userData) => {
            _performance.mark('user lookup complete');
            if (!err && userData) {
                // Hash sent password, compare to stored password
                _performance.mark('beginning password hashing');
                const hashedPassword = _utils.hash(password);
                _performance.mark('complete hashing');
                if (hashedPassword === userData.hashedPassword) {
                    // If valid, create a new token with a random name.
                    // Set expiration date 1 hour in the future.
                    _performance.mark('creating data for token');
                    const tokenID = _utils.createRandomString(20);
                    const expires = Date.now() + 1000 * 60 * 60;
                    const tokenObject = {
                        'phone': phone,
                        'tokenID': tokenID,
                        'expires': expires
                    };

                    _performance.mark('begin token storing');
                    // Store the token
                    _data.create('tokens', tokenID, tokenObject, err => {
                        _performance.mark('end token storing');

                        // Gather measurements
                        _performance.measure('Beginning to end', 'entered function', 'end token storing');
                        _performance.measure('Validating user input', 'entered function', 'inputs validated');
                        _performance.measure('User lookup', 'beginning user lookup', 'user lookup complete');
                        _performance.measure('Password hashing', 'beginning password hashing', 'complete hashing');
                        _performance.measure('Token data creation', 'creating data for token', 'begin token storing');
                        _performance.measure('Token storing', 'begin token storing', 'end token storing');

                        // Log out measurements
                        const measurements = _performance.getEntriesByType('measure');
                        measurements.forEach(measurement => debug('\x1b[33m%s\x1b[0m', measurement.name + ' ' + measurement.duration));
                        
                        if (!err) {
                            cb(200, tokenObject);
                        } else {
                            cb(500, { 'Error': 'Could not create a new token' });
                        }
                    });
                } else {
                    cb(400, { 'Error': 'Incorrect password or user ' });
                }
            } else {
                cb(400, { 'Error': 'Could not find the specified user' });
            }
        });
    } else {
        cb(400, { 'Error': 'Missing required fields' });
    }
};

// Tokens--get
// Required data: id
// Optional data: none
_tokens.get = (data, cb) => {
    const id = _helpers.validateTokenID(data.queryStringObject.id);

    if (id) {
        // Look up the user
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                cb(200, tokenData);
            } else {
                cb(404);
            }
        });
    } else {
        cb(400, { 'Error': 'Missing required field' });
    }
};

// Tokens--put
// Required data: id, extend
// Optional data: none
_tokens.put = (data, cb) => {
    const id = _helpers.validateTokenID(data.payload.id);

    const extend = _helpers.validateExtend(data.payload.extend);

    if (id && extend) {
        // Lookup token
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                // Validate that token is not already expired
                if (tokenData.expires > Date.now()) {
                    // Extend expiration +1 hour
                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                    // Store updates
                    _data.update('tokens', id, tokenData, err => {
                        if (!err) {
                            cb(200);
                        } else {
                            console.log(err);
                            cb(500, { 'Error': 'Could not extend token duration' });
                        }
                    });
                } else {
                    cb(400, { 'Error': 'Token already expired and cannot be extended' });
                }
            } else {
                cb(400, { 'Error': 'Specified token does not exist' });
            }
        });
    } else {
        cb(400, { 'Error': 'Missing required field(s) or invalid field(s)' });
    }
};

// Tokens--delete
// Required data: id
// Optional data: none
_tokens.delete = (data, cb) => {
    // Check that id is valid
    const id = _helpers.validateTokenID(data.queryStringObject.id);

    if (id) {
        // Lookup the token
        _data.read('tokens', id, (err, data) => {
            if (!err && data) {
                _data.delete('tokens', id, err => {
                    if (!err) {
                        cb(200);
                    } else {
                        cb(500, { 'Error': 'Could not delete the specified token' });
                    }
                });
            } else {
                cb(400, { 'Error': 'Could not find the specified token' });
            }
        });
    } else {
        cb(400, { 'Error': 'Missing required field' });
    }
};

module.exports = _tokens;