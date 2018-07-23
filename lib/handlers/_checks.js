/*
 * Checks handler sub-methods.
 * 
 */

// Dependencies
const _helpers = require('../_helpers');
const _data = require('../data');
const _utils = require('../utils');
const config = require('../config');

// Checks sub-methods container
_checks = {};

// Checks -- post
// Required data: protocol, url, method, successCodes, timeoutSeconds
// Optional data: none
_checks.post = (data, cb) => {
    // Validate inputs
    const protocol = _helpers.validateProtocol(data.payload.protocol);
    const url = _helpers.validateURL(data.payload.url);
    const method = _helpers.validateMethod(data.payload.method);
    const successCodes = _helpers.validateSuccessCodes(data.payload.successCodes);
    const timeoutSeconds = _helpers.validateTimeoutSeconds(data.payload.timeoutSeconds);

    if (protocol && url && method && successCodes && timeoutSeconds) {
        // Get the token from the headers
        const token = _helpers.validateTokenID(data.headers.token);

        // Lookup the user by reading the token
        _data.read('tokens', token, (err, tokenData) => {
            if (!err && tokenData) {
                const userPhone = tokenData.phone;

                // Lookup the user data
                _data.read('users', userPhone, (err, userData) => {
                    if (!err && userData) {
                        const userChecks = _helpers.validateUserChecks(userData.checks);

                        // Verify that user does not exceed max no. of checks
                        if (userChecks.length < config.maxChecks) {
                            // Create a random ID for the check
                            const checkId = _utils.createRandomString(20);

                            // Create the check object, including user's phone
                            const checkObject = {
                                'id': checkId,
                                'userPhone': userPhone,
                                'protocol': protocol,
                                'url': url,
                                'method': method,
                                'successCodes': successCodes,
                                'timeoutSeconds': timeoutSeconds
                            };

                            // Save the object
                            _data.create('checks', checkId, checkObject, err => {
                                if (!err) {
                                    // Add the checkId to user's object
                                    userData.checks = userChecks;
                                    userData.checks.push(checkId);

                                    _data.update('users', userPhone, userData, err => {
                                        if (!err) {
                                            // Return the data about the new check
                                            cb(200, checkObject);
                                        } else {
                                            cb(500, { 'Error': 'Could not update user with new check ' });
                                        }
                                    });
                                } else {
                                    cb(500, { 'Error:': 'Could not create the new check' });
                                }
                            });
                        } else {
                            cb(400, { 'Error:': `The user already has the max no. of checks (${config.maxChecks})` });
                        }
                    } else {
                        cb(403);
                    }
                });
            } else {
                cb(403);
            }
        });
    } else {
        cb(400, { 'Error:': 'Missing required inputs, or inputs invalid' });
    }
};

// Checks -- get
// Required data: checkID
// Optional data: none
_checks.get = (data, cb) => {
    // Check that phone is valid
    const checkID = _helpers.validateCheckID(data.queryStringObject.id);

    if (checkID) {
        // Lookup the check
        _data.read('checks', checkID, (err, checkData) => {
            if (!err && checkData) {
                // Get the token from the headers
                const token = _helpers.getToken(data.headers.token);

                // Verify that the given token is valid
                // and belongs to the user who created the check
                _helpers.validateToken(token, checkData.userPhone, tokenIsValid => {
                    if (tokenIsValid) {
                        // Return the checkData
                        cb(200, checkData);
                    } else {
                        cb(403);
                    }
                });
            } else {
                cb(404);
            }
        });
    } else {
        cb(400, { 'Error': 'Missing required field' });
    }
};

// Checks -- put
// Required data: id
// Optional data: protocol, url, method, successCode, timeoutSeconds
// One optional field must be sent
_checks.put = (data, cb) => {
    // Check required field (phone)
    const id = _helpers.validateID(data.payload.id);

    // Check optional fields
    const protocol = _helpers.validateProtocol(data.payload.protocol);
    const url = _helpers.validateURL(data.payload.url);
    const method = _helpers.validateMethod(data.payload.method);
    const successCodes = _helpers.validateSuccessCodes(data.payload.successCodes);
    const timeoutSeconds = _helpers.validateTimeoutSeconds(data.payload.timeoutSeconds);

    // Proceed on valid ID
    if (id) {
        // Ensure at least one optional field is present
        if (protocol || url || method || successCodes || timeoutSeconds) {
            // Look-up the check
            _data.read('checks', id, (err, checkData) => {
                if (!err && checkData) {
                    // Get the token from the headers
                    const token = _helpers.getToken(data.headers.token);

                    // Verify that the given token is valid
                    // and belongs to the user who created the check
                    _helpers.validateToken(token, checkData.userPhone, tokenIsValid => {
                        if (tokenIsValid) {
                            // Update the check where necessary
                            checkData.protocol = protocol ? protocol : checkData.protocol;
                            checkData.url = url ? url : checkData.url;
                            checkData.method = method ? method : checkData.method;
                            checkData.successCodes = successCodes ?
                                successCodes : checkData.successCodes;
                            checkData.timeoutSeconds = timeoutSeconds ? timeoutSeconds :
                                checkData.timeoutSeconds;

                            // Store updates
                            _data.update('checks', id, checkData, err => {
                                if (!err) {
                                    cb(200);
                                } else {
                                    cb(500, { 'Error': 'Could not update the check' });
                                }
                            });
                        } else {
                            cb(403);
                        }
                    });
                } else {
                    cb(400, { 'Error': 'Check ID does not exist' });
                }
            });
        } else {
            cb(400, { 'Error': 'Missing required field(s) to update' });
        }
    } else {
        cb(400, { 'Error': 'Missing required field' });
    }
};

// Checks -- delete
// Required data: id
// Optional data: none
_checks.delete = (data, cb) => {
    // Check that id is valid
    const id = _helpers.validateCheckID(data.queryStringObject.id);

    if (id) {
        // Lookup the check
        _data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                // Get the token from the headers
                const token = typeof (data.headers.token) == 'string' ?
                    data.headers.token : false;

                // Verify that the given token is valid
                // for the phone number
                _helpers.validateToken(token, checkData.userPhone, tokenIsValid => {
                    if (tokenIsValid) {
                        // Delete the check
                        _data.delete('checks', id, err => {
                            if (!err) {
                                // Look up the user
                                _data.read('users', checkData.userPhone, (err, userData) => {
                                    if (!err && userData) {
                                        // Find all user's checks
                                        const userChecks = _helpers
                                            .validateUserChecks(userData.checks);
                                        // Remove the deleted check from their list of checks
                                        const checkPosition = userChecks.indexOf(id);
                                        if (checkPosition > -1) {
                                            userChecks.splice(checkPosition, 1);
                                        } else {
                                            cb(500, { 'Error' : 'Could not find check on user\'s object' });
                                        }
                                        // Re-save user's data
                                        _data.update('users', checkData.userPhone, userData, err => {
                                            if (!err) {
                                                cb(200);
                                            } else {
                                                cb(500, { 'Error' : 'Could not update user' });
                                            }
                                        });
                                    } else {
                                        cb(500, { 'Error': 'Could not find the check creator' });
                                    }
                                });
                            } else {
                                cb(500, { 'Error': 'Could not delete check' });
                            }
                        });
                    } else {
                        cb(403, { 'Error:': 'Missing required token in header, or token is invalid' });
                    }
                });
            } else {
                cb(400, { 'Error': 'The specified check does not exist' });
            }
        });
    } else {
        cb(400, { 'Error': 'Missing required field' });
    }
};

// Export the module
module.exports = _checks;