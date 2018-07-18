/*
 * Create and export configuration variables
 * 
 */

// Environment container
const environments = {};

// Staging (default) environment
environments.staging = {
    'httpPort' : 3000,
    'httpsPort' : 3001,
    'envName' : 'staging',
    'hashingSecret' : 'thisIsASecret',
    'maxChecks' : 5
};

// Production environment
environments.production = {
    'httpPort' : 5000,
    'httpsPort' : 5001,
    'envName': 'production',
    'hashingSecret' : 'thisIsAlsoASecret',
    'maxChecks' : 5
};

// Determine which environment was passed 
// via cmd-line args
const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? 
    process.env.NODE_ENV.toLowerCase() : 
    '';

// Check that current environment is one of the
// environments above; if not, default to staging
const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ?
    environments[currentEnvironment] :
    environments.staging;

// Export the module
module.exports = environmentToExport;