/*
 * Tokens handle sub-methods.
 * 
 */

// Dependencies 
const _data = require('../data');
const helpers = require('../helpers');

// Container for tokens sub-methods
_tokens = {};

// Tokens--post
// Required data: phone, password
// Optional data: none
_tokens.post = (data, cb) => {
    const phone = typeof (data.payload.phone) == 'string' &&
        data.payload.phone.trim().length == 10 ?
        data.payload.phone.trim() : false;

    const password = typeof (data.payload.password) == 'string' &&
        data.payload.password.trim().length > 0 ?
        data.payload.password.trim() : false;

    if (phone && password) {
        // Lookup the user who matches that phone
        _data.read('users', phone, (err, userData) => {
            if (!err && userData) {
                // Hash sent password, compare to stored password
                const hashedPassword = helpers.hash(password);
                if (hashedPassword === userData.password) {
                    // If valid, create a new token with a random name.
                    // Set expiration date 1 hour in the future.
                    const tokenID = helpers.createRandomString(20);
                    const expires = Date.now() + 1000 * 60 * 60;
                    const tokenObject = {
                        'phone': phone,
                        'tokenID': tokenID,
                        'expires': expires
                    };

                    // Store the token
                    _data.create('tokens', tokenID, tokenObject, err => {
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
    // Check that ID is valid
    const id = typeof (data.queryStringObject.id) == 'string' &&
        data.queryStringObject.id.trim().length == 20 ?
        data.queryStringObject.id.trim() : false;

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
    // Validate id
    const id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ?
        data.payload.id.trim() : false;

    // Validate extend
    const extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend == true ?
        true : false;

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
    const id = typeof (data.queryStringObject.id) == 'string' &&
        data.queryStringObject.id.trim().length === 20 ?
        data.queryStringObject.id.trim() : false;

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

// Check that a given token ID is currently valid for a given user
_tokens.validateToken = (id, phone, cb) => {
    // Lookup the token
    _data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            // Check that the token is for the given user
            // and currently valid
            if (tokenData.phone === phone && tokenData.expires > Date.now()) {
                cb(true);
            } else {
                cb(false);
            }
        } else {
            cb(false);
        }
    });
};

module.exports = _tokens;