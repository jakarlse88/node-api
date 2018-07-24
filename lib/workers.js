/*
 * Worker-related tasks. 
 * 
 */

// Dependencies
const _data = require('./data');
const _helpers = require('./_helpers');
const _logs = require('./logs');
const _utils = require('./utils');
const http = require('http');
const https = require('https');
const url = require('url');
const util = require('util');
const debug = util.debuglog('workers');

// Instantiate the workers module object
const workers = {};

// Lookup all checks, get their data, send to a validator 
workers.gatherAllChecks = () => {
    // Get all the checks 
    _data.list('checks', (err, checks) => {
        if (!err && checks && checks.length > 0) {
            checks.forEach(check => {
                // Read in check data 
                _data.read('checks', check, (err, originalCheckData) => {
                    if (!err && originalCheckData) {
                        // Pass the data to check validator,
                        // which will either continue or 
                        // log errors as needed
                        workers.validateCheckData(originalCheckData);
                    } else {
                        debug('Error: could not read check data:', err);
                    }
                });
            });
        } else {
            debug('Error: could not find any checks to process');
        }
    });
};

// Sanity checking for check data
workers.validateCheckData = originalCheckData => {
    originalCheckData = _helpers
        .validateCheckObject(originalCheckData);

    originalCheckData.id = _helpers
        .validateCheckID(originalCheckData.id);

    originalCheckData.userPhone = _helpers
        .validatePhoneNumber(originalCheckData.userPhone);

    originalCheckData.protocol = _helpers
        .validateProtocol(originalCheckData.protocol);

    originalCheckData.url = _helpers
        .validateURL(originalCheckData.url);

    originalCheckData.method = _helpers
        .validateMethod(originalCheckData.method);

    originalCheckData.successCodes = _helpers
        .validateSuccessCodes(originalCheckData.successCodes);

    originalCheckData.timeoutSeconds = _helpers
        .validateTimeoutSeconds(originalCheckData.timeoutSeconds);

    // Set the keys may not be set if the workers have never
    // seen this check before
    originalCheckData.state = _helpers
        .validateCheckState(originalCheckData.state);

    originalCheckData.lastChecked = _helpers
        .validateLastChecked(originalCheckData.lastChecked);

    // If all the checks pass, pass the data along to the next
    // step of the process
    if (originalCheckData.id &&
        originalCheckData.userPhone &&
        originalCheckData.protocol &&
        originalCheckData.url &&
        originalCheckData.method &&
        originalCheckData.successCodes &&
        originalCheckData.timeoutSeconds) {
        workers.performCheck(originalCheckData);
    } else {
        debug('Error: one of the checks is improperly formatted and was skipped');
    }
};

// Perform the check, send the originalCheckData and the outcome
// of the check process to the next step of the overall process
workers.performCheck = originalCheckData => {
    // Prepare the initial check outcome
    const checkOutcome = {
        'error': false,
        'responseCode': false
    };

    // Mark that the outcome has not yet been sent
    let outcomeSent = false;

    // Parse the hostname and path from method argument
    const parsedURL = url.parse(originalCheckData.protocol + '://' + originalCheckData.url, true);
    const hostName = parsedURL.hostname;
    const path = parsedURL.path; // Using 'path' rather than 'pathname' because we want the query strings

    // Construct request
    const requestDetails = {
        'protocol': `${originalCheckData.protocol}:`,
        'hostname': hostName,
        'method': originalCheckData.method.toUpperCase(),
        'path': path,
        'timeout': originalCheckData.timeoutSeconds * 1000
    };

    // Instantiate the request object using HTTP/S
    const _moduleToUse = originalCheckData.protocol === 'http' ? http : https;
    const req = _moduleToUse.request(requestDetails, res => {
        // Grab the status of the sent request
        const status = res.statusCode;

        // Update the check outcome and pass data along
        checkOutcome.responseCode = status;
        if (!outcomeSent) {
            workers.processOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    // Bind to err event so it doesn't get thrown
    req.on('error', err => {
        // Update the checkOutcome and pass data along
        checkOutcome.error = {
            'error': true,
            'value': err
        };
        if (!outcomeSent) {
            workers.processOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    // Bind to the timeout event
    req.on('timeout', err => {
        // Update the checkOutcome and pass data along
        checkOutcome.error = {
            'error': true,
            'value': 'timeout'
        };
        if (!outcomeSent) {
            workers.processOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    // End the request
    req.end();
};

// Process check outcome, update check data as needed,
// trigger alert to user if needed.
// Special logic for accomodating a check that has never
// been tested before--don't alert on this.
workers.processOutcome = (originalCheckData, checkOutcome) => {
    // Decide whether check is considered 'up' or 'down'
    const state = !checkOutcome.error &&
        checkOutcome.responseCode &&
        originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ?
        'up' : 'down';

    // Decide whether an alert is warranted
    const alertWarranted = originalCheckData.lastChecked &&
        originalCheckData.state !== state ? true : false;

    // Log the outcome
    const timeOfCheck = Date.now
    workers.log(originalCheckData, checkOutcome, state, alertWarranted, timeOfCheck);

    // Update the check data
    const newCheckData = originalCheckData;
    newCheckData.state = state;
    newCheckData.lastChecked = timeOfCheck;

    // Save the updates
    _data.update('checks', newCheckData.id, newCheckData, err => {
        if (!err) {
            // Send new check data to next phase of process if needed
            if (alertWarranted) {
                workers.alertUserToStatusChange(newCheckData);
            } else {
                debug('Check outcome has not changed; no alert needed');
            }
        } else {
            debug('Error trying to save updates to a check');
        }
    });
};

// Alert user as to change in their check status
workers.alertUserToStatusChange = newCheckData => {
    let msg = `Alert: your check for ${newCheckData.method.toUpperCase()} `;
    msg += `${newCheckData.protocol}://${newCheckData.url} is currently: ${newCheckData.state}`;

    _utils.sendTwilioSMS(newCheckData.userPhone, msg, err => {
        if (!err) {
            debug('Success! User was alerted to a status change in their check via SMS');
            debug(msg);
        } else {
            debug('Error: could not send SMS alert to user who had a state change in their check');
            debug(err);
        }
    });
};

workers.log = (originalCheckData, checkOutcome,
    state, alertWarranted, timeOfCheck) => {
    // Form the log data
    const logData = {
        'check' : originalCheckData,
        'outcome' : checkOutcome,
        'state' : state,
        'alert' : alertWarranted,
        'time' : timeOfCheck
    };

    // Convert data to string 
    const logString = JSON.stringify(logData);

    // Determine name of log file
    const logFileName = originalCheckData.id;

    // Append logString to the file
    _logs.append(logFileName, logString, err => {
        if (!err) {
            debug('Logfile successfully written');
        } else {
            debug('Error writing log data to file');
        }
    });
};

// Timer to execute the worker process once/minute
workers.loop = () => {
    setInterval(() => {
        workers.gatherAllChecks();
    }, 1000 * 60);
};

// Rotate (compress) log files
workers.rotateLogs = () => {
    // List all non-compressed log files
    _logs.list(false, (err, logs) => {
        if (!err && logs && logs.length > 0) {
            logs.forEach(logName => {
                // Compress the data to a different file
                const logID = logName.replace('.log', '');
                const newFileID = logID + '-' + Date.now();
                _logs.compress(logID, newFileID, err => {
                    if (!err) {
                        // Truncate the log
                        _logs.truncate(logID, err => {
                            if (!err) {
                                debug('Successfully truncated log file');
                            } else {
                                debug('Error truncating log file');
                            }
                        });
                    } else {
                        debug('Error compressing a log file:', err);
                    }
                });
            });
        } else {
            debug('Error: could not find any log files to rotate');
        }
    });
};

// Timer to execute the log rotation process once/day
workers.logRotationLoop = () => {
    setInterval(() => {
        workers.rotateLogs();
    }, 1000 * 60 * 60 * 24);
};

// Init script
workers.init = () => {
    // Send to console in yellow
    console.log('\x1b[33m%s\x1b[0m', 'Background workers are running');

    // Execute all checks immediately
    workers.gatherAllChecks();

    // Call loop so checks will execute automatically
    workers.loop();

    // Compress all logs immediately
    workers.rotateLogs();

    // Call the compression loops so logs will
    // be compressed later on.
    workers.logRotationLoop();
};

// Export the module
module.exports = workers;