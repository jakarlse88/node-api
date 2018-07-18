/*
 * Checks handler sub-methods.
 * 
 */

// Dependencies
const _checksHelpers = require('./helpers/_checksHelpers');
const _tokensHelpers = require('./helpers/_tokensHelpers');
const _data = require('../data');
const config = require('../config');
const helpers = require('../helpers');

// Checks sub-methods container
_checks = {};

// Checks -- post
// Required data: protocol, url, method, successCodes, timeoutSeconds
// Optional data: none
_checks.post = (data, cb) => {
    // Validate inputs
    const protocol = _checksHelpers.validateProtocol(data.payload.protocol);

    const url = _checksHelpers.validateURL(data.payload.url);

    const method = _checksHelpers.validateMethod(data.payload.method);

    const successCodes = _checksHelpers.validateSuccessCodes(data.payload.successCodes);

    const timeoutSeconds = _checksHelpers.validateTimeoutSeconds(data.payload.timeoutSeconds); 

    if (protocol && url && method && successCodes && timeoutSeconds) {
        // Get the token from the headers
        const token = _tokensHelpers.validateID(data.headers.token);

        // Lookup the user by reading the token
        _data.read('tokens', token, (err, tokenData) => {
            if (!err && tokenData) {
                const userPhone = tokenData.phone;

                // Lookup the user data
                _data.read('users', userPhone, (err, userData) => {
                    if (!err && userData) {
                        const userChecks = _checksHelpers.validateUserChecks(userData.checks);

                        // Verify that user does not exceed max no. of checks
                        if (userChecks.length < config.maxChecks) {
                            // Create a random ID for the check
                            const checkId = helpers.createRandomString(20);

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
                                            cb(500, { 'Error' : 'Could not update user with new check '});
                                        }
                                    });
                                } else {
                                    cb(500, { 'Error:' : 'Could not create the new check' });
                                }
                            });
                        } else {
                            cb(400, { 'Error:' : `The user already has the max no. of checks (${config.maxChecks})` });
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
        cb(400, { 'Error:' : 'Missing required inputs, or inputs invalid' });
    }
};

// Export the module
module.exports = _checks;