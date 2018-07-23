/*
 * Sanity checks related to handlers sub-services.
 * 
 */

// Dependencies
const _data = require('./data');

// Container
const _helpers = {};

/* 
 * Checks
 */ 

// Validate a check ID
_helpers.validateCheckID = checkID => {
    // If checkID is a string and has a length of 20 characters,
    // proceed with the passed-in value. 
    // Otherwise, default to false.
    checkID = typeof (checkID) == 'string' && checkID.trim().length == 20 ?
        checkID.trim() : false;

    return checkID;
};

// Validate protocol
_helpers.validateProtocol = protocol => {
    // If protocol is a string and matches either
    // 'http' or 'https', proceed with the passed-in
    // value. 
    // Otherwise, default to false.
    protocol = typeof (protocol) == 'string' &&
        ['http', 'https'].indexOf(protocol) > -1 ?
        protocol : false;

    return protocol;
};

// Validate URL
_helpers.validateURL = url => {
    // If url is a string and the string is not
    // null, proceed with the passed-in value.
    // Otherwise, default to false. 
    url = typeof (url) == 'string' &&
        url.trim().length > 0 ?
        url.trim() : false;

    return url;
};

// Validate method
_helpers.validateMethod = method => {
    // If method is a string and matches one of the 
    // valid methods, proceed with the passed-in value.
    // Otherwise, default to false.
    method = typeof (method) == 'string' &&
        ['get', 'put', 'post', 'delete'].indexOf(method) > -1 ?
        method : false;

    return method;
};

// Validate successCodes
_helpers.validateSuccessCodes = successCodes => {
    // If successCodes is an array and has a non-zero length,
    // proceed with the passed-in value(s).
    // Otherwise, default to false.
    successCodes = typeof (successCodes) == 'object' &&
        successCodes instanceof Array &&
        successCodes.length > 0 ?
        successCodes : false;

    return successCodes;
};

// Validate timeoutSeconds
_helpers.validateTimeoutSeconds = timeoutSeconds => {
    // If timeoutSeconds is a whole number between 1 and 5 inclusive,
    // proceed with the passed-in value.
    // Otherwise, default to false.
    timeoutSeconds = typeof (timeoutSeconds) == 'number' &&
        timeoutSeconds % 1 === 0 &&
        timeoutSeconds >= 1 &&
        timeoutSeconds <= 5 ?
        timeoutSeconds : false;

    return timeoutSeconds;
};

// Validate userChecks 
_helpers.validateUserChecks = userChecks => {
    // If userChecks is an array, proceed with the passed-in
    // value. Otherwise, default to an empty array.
    userChecks = typeof (userChecks) == 'object' &&
        userChecks instanceof Array ?
        userChecks : [];

    return userChecks;
};

// Validate a check object
_helpers.validateCheckObject = checkObject => {
    checkObject = typeof (checkObject) == 'object' &&
        checkObject !== null ? checkObject : {};

    return checkObject;
};

// Validate a check object's state
_helpers.validateCheckState = state => {
    state = typeof (state) == 'string' &&
        ['up', 'down'].indexOf(state) > -1 ?
        state : 'down';

    return state;
};

// Validate a check object's lastChecked property
_helpers.validateLastChecked = lastChecked => {
    lastChecked = typeof (lastChecked) == 'number' &&
        lastChecked > 0 ?
        lastChecked : false;

    return lastChecked;
};

/*
 * Tokens
 */

// Validate a token id
_helpers.validateTokenID = tokenID => {
    // If tokenID is of type string and has a length of 20,
    // proceed with the passed-in value.
    // Otherwise, default to false.
    tokenID = typeof (tokenID) == 'string' &&
        tokenID.trim().length == 20 ?
        tokenID.trim() : false;

    return tokenID;
};

// Validate a token
_helpers.getToken = token => {
    // If token is of type string, proceed with the passed-in value.
    // Otherwise, default to false.
    token = typeof (token) == 'string' ?
        token : false;

    return token;
};

// Validate extend
_helpers.validateExtend = extend => {
    // If extend is of type boolean and has a value of true, 
    // proceed with true. 
    // Otherwise, default to false.
    extend = typeof (extend) == 'boolean' && extend == true ?
        true : false;

    return extend;
};

// Ensure that a given token is currently valid for a given user
_helpers.validateToken = (tokenID, userPhoneNumber, cb) => {
    // Lookup the token by tokenID
    _data.read('tokens', tokenID, (err, tokenData) => {
        if (!err && tokenData) {
            // Check that the token belongs to the given user
            // and is currently valid
            if (tokenData.phone === userPhoneNumber &&
                tokenData.expires > Date.now()) {
                cb(true);
            } else {
                cb(false);
            }
        } else {
            cb(false);
        }
    });
};

/*
 * Users
 */

// Validate firstName
_helpers.validateFirstName = firstName => {
    // If firstName is of type string and non-null,
    // proceed with the passed-in value.
    // Otherwise, default to false.
    firstName = typeof (firstName) == 'string' &&
        firstName.trim().length > 0 ?
        firstName.trim() : false;

    return firstName;
};

// Validate lastName
_helpers.validateLastName = lastName => {
    // If lastName is of type string and non-null,
    // proceed with the passed-in value.
    // Otherwise, default to false.
    lastName = typeof (lastName) == 'string' &&
        lastName.trim().length > 0 ?
        lastName.trim() : false;

    return lastName;
};

// Validate phone number
_helpers.validatePhoneNumber = phoneNumber => {
    // If phoneNumber is of type string and has a length of 10,
    // proceed with the passed-in value.
    // Otherwise, default to false.
    phoneNumber = typeof (phoneNumber) == 'string' &&
        phoneNumber .trim().length == 10 ?
        phoneNumber.trim() : false;

    return phoneNumber;
};

// Validate password
_helpers.validatePassword = password => {
    // If password is of type string and is not null,
    // proceed with the passed-in value.
    // Otherwise, default to false.
    password = typeof (password) == 'string' &&
        password.trim().length > 0 ?
        password.trim() : false;

    return password;
};

// Validate tosAgreement 
_helpers.validateTOSAgreement = tosAgreement => {
    // If tosAgreement is of type boolean and has a value of true,
    // proceed with the passed-in value.
    // Otherwise, default to false.
    tosAgreement = typeof (tosAgreement) == 'boolean' &&
        tosAgreement == true ?
        true : false;

    return tosAgreement;
};

/*
 * =============================================================================
 * Misc
 * =============================================================================
 */

_helpers.validateMessage = msg => {
    msg = typeof (msg) == 'string' && msg.trim().length > 0 &&
        msg.trim().length <= 1600 ?
        msg : false;

    return msg;
};

// Export the module
module.exports = _helpers;