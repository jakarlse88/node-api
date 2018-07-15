/*
 * Primary file for the API. 
 * 
 */

 /* Dependencies */
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

// Server responds to all requests with a string
const server = http.createServer((req, res) => {
    
    // Get URL and parse it
    const parsedURL = url.parse(req.url, true);
    
    // Get path 
    const path = parsedURL.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get query string as object
    const queryStringObject = parsedURL.query;
    
    // Get HTTP method
    const method = req.method.toUpperCase();

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

        // Send response
        res.end(`Hello, world!\n`);

        // Log request path
        console.log(`Request path: ${trimmedPath}\n`,
                    `Request method: ${method}\n`,
                    `Request query string parameters: `, queryStringObject, '\n',
                    `Request headers:`, headers, '\n',
                    `Request payload: ${buffer}\n`);
        });
});

// Start the server and have it listen on port 3000
server.listen(3000, () => {
    console.log(`Server listening on port 3000`);
});