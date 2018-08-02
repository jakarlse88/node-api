/*
 * CLI-related tasks.
 * 
 */

// Dependencies
const readline = require('readline');
const util = require('util');
const debug = util.debuglog('cli');
const events = require('events');
class _events extends events { };
const e = new _events;
const os = require('os');
const v8 = require('v8');

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
    process.exit(0);
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
    const commands = {
        'exit': 'Kill the CLI, and the rest of the app',
        'man': 'Show this help page',
        'help': 'Alias for "man" command',
        'stats': 'Get statistics on the underlying OS and resource utilisation',
        'list users': 'Show a list of all the registered users in the system',
        'more user info --{userID}': 'Show details of a specific user',
        'list checks --up / --down': 'Show a list of all the active checks in the system, including their state. The "--up" and "--down" flags are both optional.',
        'more check info --{checkID}': 'Show details of a specified check',
        'list logs': 'Show a list of all the log files available to be read (compressed and uncompressed)',
        'more log info --{fileName}': 'Show details of a specified log file'
    };

    // Show a header for the help page that is as wide as the screen
    cli.horisontalLine();
    cli.centred('CLI MANUAL');
    cli.horisontalLine();
    cli.verticalSpace(2);

    // Show each command, followed by its explanation,
    // in white and yello respectively
    for (let key in commands) {
        if (commands.hasOwnProperty(key)) {
            let value = commands[key];
            let line = '\x1b[33m' + key + '\x1b[0m';

            const padding = 60 - line.length;

            for (let i = 0; i < padding; i++) {
                line += ' ';
            }

            line += value;
            console.log(line);
            cli.verticalSpace();
        }
    }
    cli.verticalSpace(1);

    // End with another horisontalLine
    cli.horisontalLine();
};

// Create a vertical space
cli.verticalSpace = lines => {
    lines = typeof (lines) == 'number' && lines > 0 ? lines : 1;

    for (let i = 0; i < lines; i++) {
        console.log('');
    }
};

// Create a horisontal line across creen
cli.horisontalLine = () => {
    // Get the available screen size
    const width = process.stdout.columns;

    let line = '';
    for (let i = 0; i < width; i++) {
        line += '-';
    }

    console.log(line);
};

// Print centred text on screen
cli.centred = str => {
    str = typeof (str) == 'string' && str.trim().length > 0 ? str.trim() : '';

    // Get the available screen size,
    // calculate padding
    const width = process.stdout.columns;
    const leftPadding = Math.floor((width - str.length) / 2);

    // Insert left padded spacing before the string itself
    let line = '';

    for (let i = 0; i < leftPadding; i++) {
        line += ' ';
    }

    line += str;

    console.log(line);
};

// exit
cli.responders.exit = () => {
    process.exit(0);
};

// stats
cli.responders.stats = () => {
    // Compile an object of stats
    const stats = {
        "Load average": os.loadavg().join(' '),
        "CPU count": os.cpus().length,
        "Free memory": os.freemem(),
        "Current malloced memory": v8.getHeapStatistics().malloced_memory,
        "Peak malloced memory": v8.getHeapStatistics().peak_malloced_memory,
        "Allocated heap used (%)": Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
        "Available heap allocated (%)": Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
        "Uptime": os.uptime() + ' sec'
    };

    // Show a header for the stats
    cli.horisontalLine();
    cli.centred('SYSTEM STATISTICS');
    cli.horisontalLine();
    cli.verticalSpace(2);

    // Print stats
    for (let key in stats) {
        if (stats.hasOwnProperty(key)) {
            let value = stats[key];
            let line = '\x1b[33m' + key + '\x1b[0m';

            const padding = 60 - line.length;

            for (let i = 0; i < padding; i++) {
                line += ' ';
            }

            line += value;
            console.log(line);
            cli.verticalSpace();
        }
    }

    cli.verticalSpace(1);

    // End with another horisontalLine
    cli.horisontalLine();
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
    str = typeof (str) == 'string' && str.trim().length > 0 ?
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