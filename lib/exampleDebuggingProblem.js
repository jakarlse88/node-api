/*
 * This is a lib that demonstrates something throwing
 * when its init method is called
 * 
 */

// Container
const example = {};

// Init
example.init = () => {
    // This is an error created intentionally
    // (bar is not defined)
    const foo = bar;
};

// Export
module.exports = example;