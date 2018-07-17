/*
 * Request handlers
 * 
 */

// Dependencies
const _data = require('../lib/data');
const helpers = require('./helpers');

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
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    };
};

// Users submethods container
handlers._users = {};

// Users -- post
// Required: firstName, lastName, phone, password, tosAgreement
// Optional: none
handlers._users.post = (data, callback) => {
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
// @TODO Let an authenticated user access only their own object
handlers._users.get = (data, callback) => {
    // Check that phone is valid
    const phone = typeof (data.queryStringObject.phone) == 'string' &&
        data.queryStringObject.phone.trim().length == 10 ?
        data.queryStringObject.phone.trim() : false;

    if (phone) {
        // Look up the user
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                // Remove hashed password from user object to be returned
                delete data.password;
                callback(200, data);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required field' });
    }
};

// Users -- put
// Required data: phone
// Optional data: at least one -of firstName, lastName, password
// @TODO Only allow an authenticated user to update their own object
handlers._users.put = (data, callback) => {
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
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, { 'Error': 'Could not update the user' });
                        } 
                    });
                } else {
                    callback(400, { 'Error': 'The specified user does not exist' });
                }
            });
        } else {
            callback(400, { 'Error': 'Missing fields to update' });
        }
    } else {
        callback(400, { 'Error': 'Missing required field' });
    }
};

// Required data: phone
// Users -- delete
// @TODO Only allow an authenticated user to delete their own user object
// @TODO Cleanup any other data files associated with this user
handlers._users.delete = (data, callback) => {
    // Check that phone is valid
    const phone = typeof (data.queryStringObject.phone) == 'string' &&
        data.queryStringObject.phone.trim().length == 10 ?
        data.queryStringObject.phone.trim() : false;

    if (phone) {
        // Look up the user
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                _data.delete('users', phone, err => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, { 'Error' : 'Could not delete the specified user' });
                    }
                });
            } else {
                callback(400, { 'Error' : 'Could not find the specified user' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required field' });
    }
};

// Export the module
module.exports = handlers;