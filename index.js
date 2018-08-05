/*
 * Primary file for the API. 
 * 
 */

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');

// Declare the app
const app = {};

// Init function
app.init = cb => {
	// Start the server
	server.init();

	// Start the workers
	workers.init();

	// Start the CLI, and ensure this happens last
	setTimeout(() => {
		cli.init();
		cb();
	}, 50);
};

// Self-invoking only if required directly
if (require.main === module) {
	app.init(function(){});
}; 

// Export the app
module.exports = app;