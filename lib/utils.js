/*
 * Various utility functions.
 * 
 */

// Dependencies
const config = require('./config');
const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');
const path = require('path');
const fs = require('fs');

// Container
const utils = {};

// Create a SHA256 hash
utils.hash = str => {
    if (typeof (str) == 'string' && str.length > 0) {
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
utils.parseJSONToObject = str => {
    try {
        const obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {};
    }
};

// Create a string of random alpha chars of a given length
utils.createRandomString = strLen => {
    strLen = typeof (strLen) === 'number' && strLen > 0 ? strLen : false;

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
utils.sendTwilioSMS = (phoneNumber, msg, cb) => {
    // Validate parameters
    phoneNumber = typeof (phoneNumber) == 'string' &&
        phoneNumber.trim().length == 10 ?
        phoneNumber.trim() : false;

    msg = typeof (msg) == 'string' && msg.trim().length > 0 &&
        msg.trim().length <= 1600 ?
        msg : false;

    if (phoneNumber && msg) {
        // Configure request payload
        const payload = {
            'From': config.twilio.fromPhone,
            'To': '+1' + phoneNumber,
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
            if (status == 200 || status == 201) {
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

// Get the string content of a template
utils.getTemplate = (templateName, dataObject, cb) => {
    templateName = typeof (templateName) == 'string' &&
        templateName.length > 0 ? templateName : false;

    dataObject = typeof(dataObject) == 'object' && dataObject != null ?
        dataObject : {};

    if (templateName) {
        const templatesDir =
            path.join(__dirname, '/../templates/');

        fs.readFile(`${templatesDir}${templateName}.html`,
            'utf8', (err, str) => {
                if (!err && str && str.length > 0) {
                    // Perform interpolation on string
                    const finalStr = utils.interpolate(str, dataObject);
                    cb(false, finalStr);
                } else {
                    cb('No template could be found');
                }
            });
    } else {
        cb('A non-valid template name was specified');
    }
};

// Add the universal header/footer to a string,
// and pass provided data object to the header/footer
// for interpolation
utils.addUniversalTemplates = (str, dataObject, cb) => {
    str = typeof(str) == 'string' && str.length > 0 ?
        str : '';

    dataObject = typeof(dataObject) == 'object' &&dataObject != null ?
        dataObject : {};

    // Get the header
    utils.getTemplate('_header', dataObject, (err, headerStr) => {
        if (!err && headerStr) {
            // Get the footer
            utils.getTemplate('_footer', dataObject, (err, footerStr) => {
                if (!err && footerStr) {
                    // Concatenate strings
                    const fullStr = headerStr + str + footerStr;
                    cb(false, fullStr);
                } else {
                    cb('Could not find the footer template');
                }
            });
        } else {
            cb('Could not find the header template');
        }
    });
};

// Take a given string and a data object and find/replace
// all the keys within it
utils.interpolate = (str, dataObject) => {
    // Sanity checks
    str = typeof(str) == 'string' && str.length > 0 ? 
        str : '';
    
    dataObject = typeof(dataObject) == 'object' && dataObject != null ? 
        dataObject : {};

    // Add the templateGlobals to the data object,
    // prepending their key name with 'global'
    for (let keyName in config.templateGlobals) {
        if (config.templateGlobals.hasOwnProperty(keyName)) {
            dataObject[`global.${keyName}`] = 
                config.templateGlobals[keyName];
        }
    }

    // For each key of the data object, insert its value 
    // into the string at the corresponding placeholder
    for (let key in dataObject) {
        if (dataObject.hasOwnProperty(key) && typeof(dataObject[key] == 'string')) {
            const replace = dataObject[key];
            const find = `{${key}}`;

            str = str.replace(find, replace);
        }
    }

    return str;
};

// Get the contents of a static (public) asset
utils.getStaticAsset = (fileName, cb) => {
    fileName = typeof(fileName) == 'string' && fileName.length > 0 ?
        fileName : false;

    if (fileName) {
        const publicDir = path.join(__dirname, '/../public/');
        fs.readFile(publicDir + fileName, (err, assetData) => {
            if (!err && assetData) {
                cb(false, assetData);
            } else {
                cb('No file could be found');
            }
        });
    } else {
        cb('A non-valid filename was specified. ')
    }
};

// Export the module
module.exports = utils;