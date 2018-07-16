/*
 * Primary file for the API. 
 * 
 */

/* Dependencies */
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');

// Instantiate HTTP server
const httpServer = http.createServer((req, res) => {
	unifiedServer(req, res);
});

// Start HTTP server
httpServer.listen(config.httpPort, () => {
	console.log(`HTTP server listening on port ${config.httpPort} in ${config.envName} mode`);
});

// Instantiate HTTPS server
const httpsServerOptions = {
	'key': fs.readFileSync('./https/key.pem'),
	'cert': fs.readFileSync('./https/cert.pem')
};

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
	unifiedServer(req, res);
});

// Start HTTPS server
httpsServer.listen(config.httpsPort, () => {
	console.log(`HTTPS server listening on port ${config.httpsPort} in ${config.envName} mode`);
});

// Server logic HTTP/HTTPS
const unifiedServer = (req, res) => {
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

		// Choose which handler for request
		const chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ?
			router[trimmedPath] :
			handlers.notFound;

		// Construct data object to send to handler
		const data = {
			'trimmedPath': trimmedPath,
			'queryStringObject': queryStringObject,
			'method': method,
			'headers': headers,
			'payload': buffer
		};

		// Route request to handler specified in router
		chosenHandler(data, (statusCode, payload) => {
			// Use status code called back by handler, 
			// or default to 200.
			statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

			// Use the payload called back by handler, 
			// or default to an empty object.
			payload = typeof (payload) == 'object' ? payload : {};

			// Convert payload to a string
			const payloadString = JSON.stringify(payload);

			// Return response
			res.setHeader('Content-type', 'application/JSON');
			res.writeHead(statusCode);
			res.end(payloadString);

			// Log the returned response
			console.log(`Returning response with status code ${statusCode} and payload`, payloadString);
		});
	});
};

// Define handlers
const handlers = {};

// Ping handler
handlers.ping = (data, callback) => {
	callback(200);
}

// Not found handler
handlers.notFound = (data, callback) => {
	callback(404);
};

// Define request router
const router = {
	'ping': handlers.ping
};