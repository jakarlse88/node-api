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
            'head.title': 'This is the title',
            'head.description': 'This is the meta description',
            'body.title': 'Hello, templated world!',
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