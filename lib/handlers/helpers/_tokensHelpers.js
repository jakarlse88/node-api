/*
 * Helper methods for tokens handler sub-methods.
 * 
 */

// Dependencies
const _usersHelpers = require('./_usersHelpers');
const _data = require('../../data');

// Container
_tokensHelpers = {};

// Validate phone
_tokensHelpers.validatePhone = phone => {
    const valPhone = typeof (phone) == 'string' &&
        phone.trim().length == 10 ?
        phone.trim() : false;

    return valPhone;
};

// Validate password 
_tokensHelpers.validatePassword = password => {
    const pw = _usersHelpers.validatePassword(password);

    return pw;
};

// Validate token id
_tokensHelpers.validateID = id => {
    const valId = typeof (id) == 'string' &&
        id.trim().length == 20 ?
        id.trim() : false;

    return valId;
};

// Get specified token
_tokensHelpers.getToken = token => {
    const valToken = typeof(token) == 'string' ?
        token : false;

    return valToken;
};

// Validate extend
_tokensHelpers.validateExtend = extend => {
    const valExtend = typeof (extend) == 'boolean' && extend == true ?
        true : false;

    return valExtend;
};

// Check that a given token ID is currently valid for a given user
_tokensHelpers.validateToken = (id, phone, cb) => {
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

// Export the module
module.exports = _tokensHelpers;