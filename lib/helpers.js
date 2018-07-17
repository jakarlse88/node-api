/*
 * Helpers for various tasks.
 * 
 */ 

// Dependencies
const crypto = require('crypto');
const config = require('./config');

// Container
const helpers = {};

// Create a SHA256 hash
helpers.hash = str => {
    if (typeof(str) == 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', config.hashingSecret)
            .update(str)
            .digest('hex');

            return hash;
    } else {
        return false;
    }
};

// Parse a JSON string to an object in all cases,
// without throwing
helpers.parseJSONToObject = str => {
    try { 
        const obj = JSON.parse(str);
        return obj;
    } catch(e) {
        return {};
    }
};

// Create a string of random alpha chars of a given length
helpers.createRandomString = strLen => {
    strLen = typeof(strLen) === 'number' && strLen > 0 ? strLen : false;

    if (strLen) {
        // Define all the possible chars that could
        // go into the string.
        const possibleChars = 'abcdefghijklmnopqrstuvwxyz1234567890';

        // Start final string
        let str = '';

        // Append a random char to final string until 
        // given length has been reached
        for (i = 1; i <= strLen; i++) {
            const randomChar = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
            
            str += randomChar;
        }
        
        return str;
    } else {
        return false;
    }
};

// Export the module
module.exports = helpers;