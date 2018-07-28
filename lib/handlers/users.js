/*
 * Users handler sub-methods.
 * 
 */

// Dependencies
const _helpers = require('../_helpers');
const _data = require('../data');
const _utils = require('../utils');

// Users submethods container
_users = {};

// Users -- post
// Required: firstName, lastName, phone, password, tosAgreement
// Optional: none
_users.post = (data, cb) => {
    // Sanity checks for required fields
    const firstName = _helpers.validateFirstName(data.payload.firstName);

    const lastName = _helpers.validateLastName(data.payload.lastName);

    const phone = _helpers.validatePhoneNumber(data.payload.phone);

    const password = _helpers.validatePassword(data.payload.password);

    const tosAgreement = _helpers.validateTOSAgreement(data.payload.tosAgreement);

    if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure that the user doesn't already exist
        _data.read('users', phone, (err, data) => {
            if (err) {
                // Hash the password
                const hashedPassword = _utils.hash(password);

                if (hashedPassword) {
                    // Create the user object
                    const userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': true
                    };

                    // Store the user
                    _data.create('users', phone, userObject, err => {
                        if (!err) {
                            cb(200);
                        } else {
                            console.log(err);
                            cb(500, { 'Error': 'Could not create the new user' });
                        }
                    });
                } else {
                    cb(500, { 'Error': 'Could not hash the user\'s password' });
                }
            } else {
                // User already exists
                cb(400, { 'Error': 'An user with that phone number already exists.' });
            }
        });
    } else {
        cb(400, { 'Error': 'Required field(s) missing' });
    }
};

// Users -- get
// Required data: phone
// Optional data: none
_users.get = (data, cb) => {
    // Check that phone is valid
    console.log(`${data.queryStringObject.phone}`);
    const phone = _helpers.validatePhoneNumber(data.queryStringObject.phone);
    console.log(`/users/api/GET phone: ${phone}`);

    if (phone) {
        // Get the token from the headers
        const token = typeof (data.headers.token) == 'string' ?
            data.headers.token : false;

        // Verify that the given token is valid
        // for the phone number
        _helpers.validateToken(token, phone, tokenIsValid => {
            if (tokenIsValid) {
                // Look up the user
                _data.read('users', phone, (err, data) => {
                    if (!err && data) {
                        // Remove hashed password from user object to be returned
                        delete data.hashedPassword;
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
    const phone = _helpers.validatePhoneNumber(data.payload.phone);

    // Check optional fields
    const firstName = _helpers.validateFirstName(data.payload.firstName);
    const lastName = _helpers.validateLastName(data.payload.lastName);
    const password = _helpers.validatePassword(data.payload.password);

    // Error if phone is invalid
    if (phone) {
        // Error if nothing is sent to update
        if (firstName || lastName || password) {
            // Get the token from the headers
            const token = _helpers.getToken(data.headers.token);

            // Verify that the given token is valid
            // for the phone number
            _helpers.validateToken(token, phone, tokenIsValid => {
                if (tokenIsValid) {
                    // Lookup the user 
                    _data.read('users', phone, (err, userData) => {
                        if (!err && userData) {
                            // Update necessary fields
                            if (firstName) { userData.firstName = firstName; }
                            if (lastName) { userData.lastName = lastName; }
                            if (password) { userData.hashedPassword = _utils.hash(password); }

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
_users.delete = (data, cb) => {
    // Check that phone is valid
    const phone = _helpers.validatePhone(data.queryStringObject.phone);

    if (phone) {
        // Get the token from the headers
        const token = typeof (data.headers.token) == 'string' ?
            data.headers.token : false;

        // Verify that the given token is valid
        // for the phone number
        _helpers.validateToken(token, phone, tokenIsValid => {
            if (tokenIsValid) {
                // Look up the user
                _data.read('users', phone, (err, userData) => {
                    if (!err && userData) {
                        _data.delete('users', phone, err => {
                            if (!err) {
                                // Delete checks associated with this user
                                const userChecks = _helpers.validateUserChecks(userData.checks);
                                const checksToDelete = userChecks.length;
                                if (checksToDelete > 0) {
                                    let checksDeleted = 0;
                                    let deletionErrors = false;
                                    
                                    // Loop through checks
                                    userChecks.forEach(checkId => {
                                        // Delete the check
                                        _data.delete('checks', checkId, err => {
                                            if (err) {
                                                deletionErrors = true;
                                            } 
                                            checksDeleted++;
                                            if (checksDeleted == checksToDelete) {
                                                if (!deletionErrors) {
                                                    cb(200);
                                                } else {
                                                    cb(500, { 'Error' : 'Errors encountered while attempting to delete all of the user\'s checks: all checks may not have been successfully deleted from the system' });
                                                }
                                            }
                                        });
                                    });
                                } else {
                                    cb(200);
                                }
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