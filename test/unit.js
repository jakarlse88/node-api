/*
 * Unit tests
 * 
 */

// Dependencies
const _utils = require('../lib/utils');
const assert = require('assert');
const _logs = require('../lib/logs');
const exampleDebuggingProblem = require('../lib/exampleDebuggingProblem');

// Container
const unit = {};

unit['utils.getANumber should return a number'] = done => {
    const val = _utils.getANumber();
    assert.equal(typeof (val), 'number');
    done();
};

unit['utils.getANumber should return 1'] = done => {
    const val = _utils.getANumber();
    assert.equal(val, 1);
    done();
};

// Expected to fail
unit['utils.getANumber should return 2'] = done => {
    const val = _utils.getANumber();
    assert.equal(val, 2);
    done();
};

unit['_logs.list should callback a false error and an array of log names'] = done => {
    _logs.list(true, (err, logFileNames) => {
        assert.equal(err, false);
        assert.ok(logFileNames instanceof Array);
        assert.ok(logFileNames.length > 1);
        done();
    });
};

unit['_logs.truncate should not throw if the log ID does not exist, but rather callback an error'] = done => {
    assert.doesNotThrow(() => {
        _logs.truncate('I do not exist', err =>{
            assert.ok(err);
            done();
        });
    }, TypeError);
};

unit['exampleDebuggingProblem.init should not throw when called'] = done => {
    assert.doesNotThrow(() => {
        exampleDebuggingProblem.init();
        done();
    }, TypeError);
};


// Export
module.exports = unit;