/*
 * Server-related tasks. 
 * 
 */

/* Dependencies */
const _utils = require('./utils');
const config = require('./config');
const fs = require('fs');
const handlers = require('./handlers');
const http = require('http');
const https = require('https');
const path = require('path');
const StringDecoder = require('string_decoder').StringDecoder;
const url = require('url');
const util = require('util');
const debug = util.debuglog('server');

// Instantiate the server module object
const server = {};

// @TODO GET RID OF THIS 
// _utils.sendTwilioSMS('97613293', 'Hello!', err => {
//     console.log(`Error encountered: ${err}`);
// });

// Instantiate HTTP server
server.httpServer = http.createServer((req, res) => {
    server.unifiedServer(req, res);
});

// Instantiate HTTPS server
server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};

server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
    server.unifiedServer(req, res);
});

// Server logic HTTP/HTTPS
server.unifiedServer = (req, res) => {
    // Get URL and parse it
    const parsedURL = url.parse(req.url, true);

    // Get path 
    const path = parsedURL.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get query string as object
    const queryStringObject = parsedURL.query;

    // Get HTTP method
    const method = req.method.toLowerCase();

    // Get headers as object
    const headers = req.headers;

    // Get payload, if present
    const decoder = new StringDecoder('utf-8');

    let buffer = '';

    req.on('data', data => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

        // Choose which handler for request
        let chosenHandler = typeof (server.router[trimmedPath]) !== 'undefined' ?
            server.router[trimmedPath] :
            handlers.notFound;

        // If the request is within the /public/ dir, 
        // use the public handler instead
        chosenHandler = trimmedPath.indexOf('public/') > -1 ? 
            handlers.public : chosenHandler;

        // Construct data object to send to handler
        const data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': _utils.parseJSONToObject(buffer)
        };

        // Route request to handler specified in router
        chosenHandler(data, (statusCode, payload, contentType) => {
            // Determine type of response (fallback to JSON)
            contentType = typeof (contentType) == 'string' ? contentType : 'json';

            // Use status code called back by handler, 
            // or default to 200.
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

            // Return response-parts that are content-specific
            let payloadString = '';

            if (contentType == 'json') {
                res.setHeader('Content-Type', 'application/json');

                // Use the payload called back by handler, 
                // or default to an empty object.
                payload = typeof (payload) == 'object' ? payload : {};

                // Convert payload to a string
                payloadString = JSON.stringify(payload);
            }

            if (contentType == 'html') {
                res.setHeader('Content-Type', 'text/html');

                // Use the payload called back by handler,
                // or default to an empty string.
                payloadString = typeof(payload) == 'string' ? payload : '';
            }

            if (contentType == 'favicon') {
                res.setHeader('Content-Type', 'image/x-icon');

                // Use the payload called back by handler,
                // or default to an empty string.
                payloadString = typeof(payload) !== 'undefined' ? payload : '';
            }

            if (contentType == 'css') {
                res.setHeader('Content-Type', 'text/css');

                // Use the payload called back by handler,
                // or default to an empty string.
                payloadString = typeof(payload) !== 'undefined' ? payload : '';
            }

            if (contentType == 'png') {
                res.setHeader('Content-Type', 'image/png');

                // Use the payload called back by handler,
                // or default to an empty string.
                payloadString = typeof(payload) !== 'undefined' ? payload : '';
            }

            if (contentType == 'jpg') {
                res.setHeader('Content-Type', 'image/jpeg');

                // Use the payload called back by handler,
                // or default to an empty string.
                payloadString = typeof(payload) != 'undefined' ? payload : '';
            }

            if (contentType == 'plain') {
                res.setHeader('Content-Type', 'text/plain');

                // Use the payload called back by handler,
                // or default to an empty string.
                payloadString = typeof(payload) !== 'undefined' ? payload : '';
            }
            

            // Return response-parts that are common to all content types
            res.writeHead(statusCode);
            res.end(payloadString);

            // If the response is 200, print green;
            // otherwise, print red.
            if (statusCode == 200) {
                debug('\x1b[32m%s\x1b[0m', `${method.toUpperCase()}/${trimmedPath} ${statusCode}`);
            } else {
                debug('\x1b[31m%s\x1b[0m', `${method.toUpperCase()}/${trimmedPath} ${statusCode}`);
            }
        });
    });
};

// Define request router
server.router = {
    '': handlers.index,
    'account/create': handlers.accountCreate,
    'account/edit': handlers.accountEdit,
    'account/deleted': handlers.accountDeleted,
    'session/create': handlers.sessionCreate,
    'session/deleted': handlers.sessionDeleted,
    'checks/all': handlers.checksList,
    'checks/create': handlers.checksCreate,
    'checks/edit': handlers.checksEdit,
    'checks': handlers.checks,
    'ping': handlers.ping,
    'api/tokens': handlers.tokens,
    'api/users': handlers.users,
    'favicon.ico': handlers.favicon,
    'public': handlers.public
};

// Init script
server.init = () => {
    // Start HTTP server
    server.httpServer.listen(config.httpPort, () => {
        console.log('\x1b[36m%s\x1b[0m', `HTTP server listening on port ${config.httpPort} in ${config.envName} mode`);
    });

    // Start the HTTPS server
    server.httpsServer.listen(config.httpsPort, () => {
        console.log('\x1b[35m%s\x1b[0m', `HTTPS server listening on port ${config.httpsPort} in ${config.envName} mode`);
    });
};

// Export the module 
module.exports = server;