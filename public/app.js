/*
 * Front-end logic
 * 
 */

// Container for front-end app
const app = {};

// Config
app.config = {
    'sessionToken': false
};

// AJAX client for the restful API
app.client = {};

// Interface for making API calls
app.client.request = (headers, path, method,
    queryStringObject, payload, cb) => {

    // Set defaults
    headers = typeof (headers) == 'object' && headers !== null ?
        headers : {};

    path = typeof (path) == 'string' ? path : '/';

    method = typeof (method) == 'string' &&
        ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method) > -1 ?
        method.toUpperCase() : 'GET';

    queryStringObject = typeof (queryStringObject) == 'object' &&
        queryStringObject !== null ?
        queryStringObject : {};

    payload = typeof (payload) == 'object' && payload !==
        null ? payload : {};

    cb = typeof (cb) == 'function' ? cb : false;

    // For each queryString param sent, add it to the path
    let requestURL = `${path}?`;
    let counter = 0;
    for (let queryKey in queryStringObject) {
        if (queryStringObject.hasOwnProperty(queryKey)) {
            counter++;
            // If at least one query string param has
            // already been added, prepend new ones with '&'
            if (counter > 1) {
                requestURL += '&';
            }
            // Add key/value
            requestURL += `${queryKey}=${queryStringObject.queryKey}`;
            
        }
    }

    // Form HTTP req as a JSON type
    const xhr = new XMLHttpRequest();
    xhr.open(method, requestURL, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    // For each header sent, add it to req one by one
    for (let headerKey in headers) {
        if (headers.hasOwnProperty(headerKey)) {
            xhr.setRequestHeader(headerKey, headers.headerKey);
        }
    }

    // If there is a current session token set,
    // add that as header
    if (app.config.sessionToken) {
        xhr.setRequestHeader("token", app.config.sessionToken.id);
    }

    // When the req comes back, handle response
    xhr.onreadystatechange = () => {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            const statusCode = xhr.status;
            const responseReturned = xhr.responseText;

            // Callback if requested
            if (cb) {
                try {
                    const parsedResponse = JSON.parse(responseReturned);
                    cb(statusCode, parsedResponse);
                } catch(err) {
                    cb(statusCode, false);
                }
            }
        }
    }

    // Send req as JSON
    const payloadString = JSON.stringify(payload);
    xhr.send(payloadString);
};