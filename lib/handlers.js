/*
 * Request handlers master logic.
 * 
 */

// Dependencies
const _users = require('./handlers/users');
const _tokens = require('./handlers/tokens');
const _checks = require('./handlers/checks');
const _utils = require('./utils');

// Define handlers
const handlers = {};

// Ping handler
handlers.ping = (data, cb) => {
    cb(200);  
}

// Not found handler
handlers.notFound = (data, cb) => {
    cb(404);
};

/*
 * HTML handlers
 * 
 */

// Index handler 
handlers.index = (data, cb) => {
    // Reject any request except GET
    if (data.method == 'get') {
        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Uptime Monitoring - Made Simple',
            'head.description': 'We offer free, simple uptime monitoring for HTTP/HTTPS websites',
            'body.class': 'index'
        };

        // Read in a template as a string
        _utils.getTemplate('index', templateData, (err, str) => {
            if (!err && str) {
                // Add universal header/footer
                _utils.addUniversalTemplates(str, templateData,(err, fullStr) =>{
                    if (!err && fullStr) {
                        // Return that page as HTML
                        cb(200, fullStr, 'html');
                    } else {
                        cb(500, undefined, 'html');
                    }
                });
            } else {
                cb(500, undefined, 'html');
            }
        });
    } else {
        cb(405, undefined, 'html');
    }
}; 

// Create account handler
handlers.accountCreate = (data, cb) => {
    // Reject any request except GET
    if (data.method == 'get') {
        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Create an account',
            'head.description': 'Signup is easy and only takes a few seconds',
            'body.class': 'accountCreate'
        };

        // Read in a template as a string
        _utils.getTemplate('accountCreate', templateData, (err, str) => {
            if (!err && str) {
                // Add universal header/footer
                _utils.addUniversalTemplates(str, templateData,(err, fullStr) =>{
                    if (!err && fullStr) {
                        // Return that page as HTML
                        cb(200, fullStr, 'html');
                    } else {
                        cb(500, undefined, 'html');
                    }
                });
            } else {
                cb(500, undefined, 'html');
            }
        });
    } else {
        cb(405, undefined, 'html');
    }
};

// Create new session
handlers.sessionCreate = (data, cb) => {
    // Reject any request except GET
    if (data.method == 'get') {
        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Login to your account',
            'head.description': 'Please enter your phone number and password to access your account',
            'body.class': 'sessionCreate'
        };

        // Read in a template as a string
        _utils.getTemplate('sessionCreate', templateData, (err, str) => {
            if (!err && str) {
                // Add universal header/footer
                _utils.addUniversalTemplates(str, templateData,(err, fullStr) =>{
                    if (!err && fullStr) {
                        // Return that page as HTML
                        cb(200, fullStr, 'html');
                    } else {
                        cb(500, undefined, 'html');
                    }
                });
            } else {
                cb(500, undefined, 'html');
            }
        });
    } else {
        cb(405, undefined, 'html');
    }
};

// favicon
handlers.favicon = (data, cb) => {
    // Reject any method that isn't GET
    if (data.method == 'get') {
        // Read in the favicon's data
        _utils.getStaticAsset('favicon.ico', (err, faviconData) => {
            if (!err && faviconData) {
                cb(200, faviconData, 'favicon');
            } else {
                cb(500);
            }
        });
    } else {
        cb(405);
    }
};


// Public assets
handlers.public = (data, cb) => {
    // Reject any method that isn't GET
    if (data.method == 'get') {
        // Get the filename being requested
        const trimmedAssetName = data.trimmedPath.replace('public/', '').trim();
        
        if (trimmedAssetName.length > 0) {
            // Read in the asset's data
            _utils.getStaticAsset(trimmedAssetName, (err, assetData) => {
                if (!err && assetData) {
                    // Determine content type, default to plain texts
                    let contentType = 'plain';

                    if (trimmedAssetName.indexOf('.css') > -1) {
                        contentType = 'css';
                    }

                    if (trimmedAssetName.indexOf('.png') > -1) {
                        contentType = 'png';
                    }

                    if (trimmedAssetName.indexOf('.jpg') > -1) {
                        contentType = 'jpg';
                    }
                    
                    if (trimmedAssetName.indexOf('.ico') > -1) {
                        contentType = 'favicon';
                    }

                    // Callback the data
                    cb(200, assetData, contentType);
                } else {
                    cb(404);
                }
            });
        } else {
            cb(404);
        }
    } else {
        cb(405);
    }
};

/*
 * JSON API handlers
 * 
 */

// Users handler
handlers.users = (data, cb) => {
    const acceptableMethods = [
        'post',
        'get',
        'put',
        'delete'
    ];

    if (acceptableMethods.indexOf(data.method) > -1) {
        _users[data.method](data, cb);
    } else {
        cb(405);
    };
};

// Tokens handler
handlers.tokens = (data, cb) => {
    const acceptableMethods = [
        'post',
        'get',
        'put',
        'delete'
    ];

    if (acceptableMethods.indexOf(data.method) > -1) {
        _tokens[data.method](data, cb);
    } else {
        cb(405);
    };
};

// Checks handler
handlers.checks = (data, cb) => {
    const acceptableMethods = [
        'post',
        'get',
        'put', 
        'delete'
    ];

    if (acceptableMethods.indexOf(data.method) > -1) {
        _checks[data.method](data, cb);
    } else {
        cb(405);
    };
};

// Export the module
module.exports = handlers;