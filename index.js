/*
 * Primary file for the API. 
 * 
 */

 /* Dependencies */
const http = require('http');
const url = require('url');

// Server responds to all requests with a string
const server = http.createServer((req, res) => {
    
    // Get URL and parse it
    const parsedURL = url.parse(req.url, true);
    
    // Get path from URL
    const path = parsedURL.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    
    // Get HTTP method
    const method = req.method.toUpperCase();

    // Send response
    res.end(`Hello, world!\n`);

    // Log request path
    console.log(`Request received on path: ${trimmedPath} with method: ${method}`);
});

// Start the server and have it listen on port 3000
server.listen(3000, () => {
    console.log(`Server listening on port 3000`);
});