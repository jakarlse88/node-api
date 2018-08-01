/*
 * CLI-related tasks.
 * 
 */

// Dependencies
const readline = require('readline');
const util = require('util');
const debug = util.debuglog('cli');
const events = require('events');
class _events extends events{};
const e = new _events;

// Instantiate the CLI module object
const cli = {};

/*
 * Input handlers
 */

e.on('man', str => {
    cli.responders.help();
});

e.on('help', str => {
    cli.responders.help();
});

e.on('exit', str => {
    cli.responders.exit();
});

e.on('stats', str => {
    cli.responders.stats();
});

e.on('list users', str => {
    cli.responders.listUsers();
});

e.on('more user info', str => {
    cli.responders.moreUserInfo(str);
});

e.on('list checks', str => {
    cli.responders.listChecks(str);
});

e.on('more check info', str => {
    cli.responders.moreCheckInfo(str);
});

e.on('list logs', str => {
    cli.responders.listLogs();
});

e.on('more log info', str => {
    cli.responders.moreLogInfo(str);
});

/*
 * Responders object
 */
cli.responders = {};

// help / man
cli.responders.help = () => {
    console.log('You asked for man/help');
};

// exit
cli.responders.exit = () => {
    console.log('You asked for exit');
};

// stats
cli.responders.stats = () => {
    console.log('You asked for stats');
};

// list users
cli.responders.listUsers = () => {
    console.log('You asked for listUsers');
};

// more user info
cli.responders.moreUserInfo = str => {
    console.log('You asked for more user info', str);
};

// list checks
cli.responders.listChecks = str => {
    console.log('You asked to list checks', str);
};

// more check info
cli.responders.moreCheckInfo = str => {
    console.log('You asked for more check info', str);
};

// list logs
cli.responders.listLogs = () => {
    console.log('You asked for list logs');
};

// more log info
cli.responders.moreLogInfo = str => {
    console.log('You asked for exit', str);
};

/*
 * Input processor
 */
cli.processInput = str => {
    str = typeof(str) == 'string' && str.trim().length > 0 ?
        str.trim() : false;
    
    // Only process input if user actually wrote something
    if (str) {
        // Codify the unique strings that identify the unique
        // questions allowed to be asked
        const uniqueInputs = [
            'man',
            'help',
            'exit',
            'stats',
            'list users',
            'more user info',
            'list checks',
            'more check info',
            'list logs',
            'more log info'
        ];

        // Go through possible inputs and emit an event 
        // if a match is found
        let matchFound = false;
        let counter = 0;
        uniqueInputs.some(input => {
            if (str.toLowerCase().indexOf(input) > -1) {
                matchFound = true;

                // Emit an event matching the unique input 
                // and include the full string given by user
                e.emit(input, str);
                return true;
            }
        });

        // If no match is found, tell user to try again
        if (!matchFound) {
            console.log('Command not recognised; please try again.');
        }
    }
};

/*
 * Init script
 */
cli.init = () => {
    // Send start message to console in dark blue
    console.log('\x1b[34m%s\x1b[0m', `CLI now running`);

    // Start the interface
    const _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '> '
    });

    // Create an initial prompt
    _interface.prompt();

    // Handle each line of input separately
    _interface.on('line', str => {
        // Send to the input processor
        cli.processInput(str);
    });

    // Re-initialise prompt
    _interface.prompt();

    // If the user stops the CLI,
    // kill the associated process
    _interface.on('close', () => {
        process.exit(0);
    });
};

// Export CLI module object
module.exports = cli;