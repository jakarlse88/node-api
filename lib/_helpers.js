/*
 * Helpers for various tasks.
 * 
 */ 

// Dependencies
const _handlersHelpers = require('./handlers/_handlersHelpers');
const config = require('./config');
const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');

// Container
const _helpers = {};

// Create a SHA256 hash
_helpers.hash = str => {
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
_helpers.parseJSONToObject = str => {
    try { 
        const obj = JSON.parse(str);
        return obj;
    } catch(e) {
        return {};
    }
};

// Create a string of random alpha chars of a given length
_helpers.createRandomString = strLen => {
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

// Send an SMS message via Twilio
_helpers.sendTwilioSMS = (phoneNumber, msg, cb) => {
    // Validate parameters
    phoneNumber = typeof (phoneNumber) == 'string' &&
        phoneNumber.trim().length == 8 ?
        phoneNumber.trim() : false;
    
    msg = typeof(msg) == 'string' && msg.trim().length > 0 && 
        msg.trim().length <= 1600 ? 
        msg : false;

    if (phoneNumber && msg) {
        // Configure request payload
        const payload = {
            'From': config.twilio.fromPhone,
            'To': '+47' + phoneNumber,
            'Body': msg
        };

        // Stringify the payload
        const stringPayload = querystring.stringify(payload);

        //Configure request details
        const requestDetails = {
            "protocol": "https:",
            "hostname": "api.twilio.com",
            "method": "POST",
            "path": "/2010-04-01/Accounts/" + config.twilio.accountSid + "/Messages.json",
            "auth": config.twilio.accountSid + ":" + config.twilio.authToken,
            "headers": {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": Buffer.byteLength(stringPayload)
            }
        };

        // Instantiate the request object
        const req = https.request(requestDetails, res => {
            // Grab the status of the received request
            const status = res.statusCode;
            // Callback successfully if the request went through
            if (status == 200 ||status == 201) {
                cb(false);
            } else {
                cb(`Returned status code was ${status}`);
            }
        });

        // Bind to the error event so it doesn't get thrown
        req.on('error', err => {
            cb(err);
        });

        // Add payload to the request
        req.write(stringPayload);

        // End the request
        req.end();
    } else {
        cb('Parameters missing or invalid');
    }
};

// Export the module
module.exports = _helpers;