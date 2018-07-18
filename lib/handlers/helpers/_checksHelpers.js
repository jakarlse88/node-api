/*
 * Helper methods for checks handler sub-methods.
 * 
 */

// Dependencies

// Container
_checksHelpers = {};

// Validate ID
_checksHelpers.validateID = id => {
    const valId = typeof(id) == 'string' && id.trim().length == 20 ?
        id.trim() : false;

    return valId;
};

// Validate protocol
_checksHelpers.validateProtocol = protocol => {
    const valProtocol = typeof (protocol) == 'string' &&
        ['http', 'https'].indexOf(protocol) > -1 ?
        protocol : false;

    return valProtocol;
};

// Validate URL
_checksHelpers.validateURL = url => {
    const valUrl = typeof (url) == 'string' &&
        url.trim().length > 0 ?
        url.trim() : false;

    return valUrl;
};

// Validate method
_checksHelpers.validateMethod = method => {
    const valMethod = typeof (method) == 'string' &&
        ['get', 'put', 'post', 'delete'].indexOf(method) > -1 ?
        method : false;

    return valMethod;
}

// Validate successCodes
_checksHelpers.validateSuccessCodes = successCodes => {
    const valSuccessCodes = typeof (successCodes) == 'object' &&
        successCodes instanceof Array &&
        successCodes.length > 0 ?
        successCodes : false;

    return valSuccessCodes;
};

// Validate timeoutSeconds
_checksHelpers.validateTimeoutSeconds = timeoutSeconds => {
    const valTimeoutSeconds = typeof (timeoutSeconds) == 'number' &&
        timeoutSeconds % 1 === 0 &&
        timeoutSeconds >= 1 &&
        timeoutSeconds <= 5 ?
        timeoutSeconds : false;

    return valTimeoutSeconds;
};

// Validate userChecks 
_checksHelpers.validateUserChecks = userChecks => {
    const valUserChecks = typeof(userChecks) == 'object' &&
        userChecks instanceof Array ?
        userChecks : [] ;

    return valUserChecks;
};

// Export the module
module.exports = _checksHelpers;