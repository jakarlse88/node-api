/*
 * Users handler sub-methods.
 * 
 */

// Dependencies
const _data = require('../data');
const _tokens = require('./_tokens');
const helpers = require('../helpers');

// Users submethods container
_users = {};

// Users -- post
// Required: firstName, lastName, phone, password, tosAgreement
// Optional: none
_users.post = (data, callback) => {
    // Sanity checks for required fields
    const firstName = typeof (data.payload.firstName) == 'string' &&
        data.payload.firstName.trim().length > 0 ?
        data.payload.firstName.trim() : false;

    const lastName = typeof (data.payload.lastName) == 'string' &&
        data.payload.lastName.trim().length > 0 ?
        data.payload.lastName.trim() : false;

    const phone = typeof (data.payload.phone) == 'string' &&
        data.payload.phone.trim().length == 10 ?
        data.payload.phone.trim() : false;

    const password = typeof (data.payload.password) == 'string' &&
        data.payload.password.trim().length > 0 ?
        data.payload.password.trim() : false;

    const tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' &&
        data.payload.tosAgreement == true ?
        true : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure that the user doesn't already exist
        _data.read('users', phone, (err, data) => {
            if (err) {
                // Hash the password
                const hashPassword = helpers.hash(password);

                if (hashPassword) {
                    // Create the user object
                    const userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'password': hashPassword,
                        'tosAgreement': true
                    };

                    // Store the user
                    _data.create('users', phone, userObject, err => {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, { 'Error': 'Could not create the new user' });
                        }
                    });
                } else {
                    callback(500, { 'Error': 'Could not hash the user\'s password' });
                }
            } else {
                // User already exists
                callback(400, { 'Error': 'An user with that phone number already exists.' });
            }
        });
    } else {
        callback(400, { 'Error': 'Required field(s) missing' });
    }
};

// Users -- get
// Required data: phone
// Optional data: none
_users.get = (data, cb) => {
    // Check that phone is valid
    const phone = typeof (data.queryStringObject.phone) == 'string' &&
        data.queryStringObject.phone.trim().length == 10 ?
        data.queryStringObject.phone.trim() : false;

    if (phone) {
        // Get the token from the headers
        const token = typeof (data.headers.token) == 'string' ?
            data.headers.token : false;

        // Verify that the given token is valid
        // for the phone number
        _tokens.validateToken(token, phone, tokenIsValid => {
            if (tokenIsValid) {
                // Look up the user
                _data.read('users', phone, (err, data) => {
                    if (!err && data) {
                        // Remove hashed password from user object to be returned
                        delete data.password;
                        cb(200, data);
                    } else {
                        cb(404);
                    }
                });
            } else {
                cb(403, { 'Error:': 'Missing required token in header, or token is invalid' });
            }
        });
    } else {
        cb(400, { 'Error': 'Missing required field' });
    }
};

// Users -- put
// Required data: phone
// Optional data: at least one -of firstName, lastName, password
_users.put = (data, cb) => {
    // Check required field (phone)
    const phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ?
        data.payload.phone.trim() : false;

    // Check optional fields
    const firstName = typeof (data.payload.firstName) == 'string' &&
        data.payload.firstName.trim().length > 0 ?
        data.payload.firstName.trim() : false;

    const lastName = typeof (data.payload.lastName) == 'string' &&
        data.payload.lastName.trim().length > 0 ?
        data.payload.lastName.trim() : false;

    const password = typeof (data.payload.password) == 'string' &&
        data.payload.password.trim().length > 0 ?
        data.payload.password.trim() : false;

    // Error if phone is invalid
    if (phone) {
        // Error if nothing is sent to update
        if (firstName || lastName || password) {
            // Get the token from the headers
            const token = typeof (data.headers.token) == 'string' ?
                data.headers.token : false;

            // Verify that the given token is valid
            // for the phone number
            _tokens.validateToken(token, phone, tokenIsValid => {
                if (tokenIsValid) {
                    // Lookup the user 
                    _data.read('users', phone, (err, userData) => {
                        if (!err && userData) {
                            // Update necessary fields
                            if (firstName) { userData.firstName = firstName; }
                            if (lastName) { userData.lastName = lastName; }
                            if (password) { userData.password = helpers.hash(password); }

                            // Persist update to disk
                            _data.update('users', phone, userData, err => {
                                if (!err) {
                                    cb(200);
                                } else {
                                    console.log(err);
                                    cb(500, { 'Error': 'Could not update the user' });
                                }
                            });
                        } else {
                            cb(400, { 'Error': 'The specified user does not exist' });
                        }
                    });
                } else {
                    cb(403, { 'Error:': 'Missing required token in header, or token is invalid' });
                }
            });
        } else {
            cb(400, { 'Error': 'Missing fields to update' });
        }
    } else {
        cb(400, { 'Error': 'Missing required field' });
    }
};

// Required data: phone
// Users -- delete
// @TODO Cleanup any other data files associated with this user
_users.delete = (data, cb) => {
    // Check that phone is valid
    const phone = typeof (data.queryStringObject.phone) == 'string' &&
        data.queryStringObject.phone.trim().length == 10 ?
        data.queryStringObject.phone.trim() : false;

    if (phone) {
        // Get the token from the headers
        const token = typeof (data.headers.token) == 'string' ?
            data.headers.token : false;

        // Verify that the given token is valid
        // for the phone number
        _tokens.validateToken(token, phone, tokenIsValid => {
            if (tokenIsValid) {
                // Look up the user
                _data.read('users', phone, (err, data) => {
                    if (!err && data) {
                        _data.delete('users', phone, err => {
                            if (!err) {
                                cb(200);
                            } else {
                                cb(500, { 'Error': 'Could not delete the specified user' });
                            }
                        });
                    } else {
                        cb(400, { 'Error': 'Could not find the specified user' });
                    }
                });
            } else {
                cb(403, { 'Error:': 'Missing required token in header, or token is invalid' });
            }
        });
    } else {
        cb(400, { 'Error': 'Missing required field' });
    }
};

module.exports = _users;