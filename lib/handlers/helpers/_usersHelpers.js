/*
 * Helper methods for users handler sub-methods.
 * 
 */

// Dependencies

// Container
_usersHelpers = {};

// Validate firstName
_usersHelpers.validateFirstName = firstName => {
    const valFirstName = typeof (firstName) == 'string' &&
        firstName.trim().length > 0 ?
        firstName.trim() : false;

    return valFirstName;
};

// Validate lastName
_usersHelpers.validateLastName = lastName => {
    const valLastName = typeof (lastName) == 'string' &&
        lastName.trim().length > 0 ?
        lastName.trim() : false;

    return valLastName;
};

// Validate phone
_usersHelpers.validatePhone = phone => {
    const valPhone = typeof (phone) == 'string' &&
        phone.trim().length == 10 ?
        phone.trim() : false;

    return valPhone;
};

// Validate password
_usersHelpers.validatePassword = password => {
    const valPassword = typeof (password) == 'string' &&
        password.trim().length > 0 ?
        password.trim() : false;

    return valPassword;
};

// Validate tosAgreement 
_usersHelpers.validateTOSAgreement = tosAgreement => {
    const valTosAgreement = typeof (tosAgreement) == 'boolean' &&
        tosAgreement == true ?
        true : false;
    
    return valTosAgreement;
};

// Export the module
module.exports = _usersHelpers;