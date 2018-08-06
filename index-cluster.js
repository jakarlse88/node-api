/*
 * Primary file for the API. 
 * 
 */

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');
const cluster = require('cluster');
const os = require('os');

// Declare the app
const app = {};

// Init function
app.init = cb => {

	// If we're on the master thread, start background
	// workers and CLI
	if (cluster.isMaster) {
		// Start the workers
		workers.init();

		// Start the CLI, and ensure this happens last
		setTimeout(() => {
			cli.init();
			cb();
		}, 50);

		// Fork the process
		for (let i = 0; i < os.cpus().length; i++) {
			cluster.fork();
		}

	} else {
		// If we're not on the master thread,
		// start the HTTP server
		server.init();
	}



};

// Self-invoking only if required directly
if (require.main === module) {
	app.init(function(){});
}; 

// Export the app
module.exports = app;