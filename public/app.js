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

// Bind the forms
app.bindForms = function(){
  document.querySelector("form").addEventListener("submit", function(e){

    // Stop it from submitting
    e.preventDefault();
    var formId = this.id;
    var path = this.action;
    var method = this.method.toUpperCase();

    // Hide the error message (if it's currently shown due to a previous error)
    document.querySelector("#"+formId+" .formError").style.display = 'hidden';

    // Turn the inputs into a payload
    var payload = {};
    var elements = this.elements;
    for(var i = 0; i < elements.length; i++){
      if(elements[i].type !== 'submit'){
        var valueOfElement = elements[i].type == 'checkbox' ? elements[i].checked : elements[i].value;
        payload[elements[i].name] = valueOfElement;
      }
    }

    // Call the API
    app.client.request(undefined,path,method,undefined,payload,function(statusCode,responsePayload){
      // Display an error on the form if needed
      if(statusCode !== 200){

        // Try to get the error from the api, or set a default error message
        var error = typeof(responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again';

        // Set the formError field with the error text
        document.querySelector("#"+formId+" .formError").innerHTML = error;

        // Show (unhide) the form error field on the form
        document.querySelector("#"+formId+" .formError").style.display = 'block';

      } else {
        // If successful, send to form response processor
        app.formResponseProcessor(formId,payload,responsePayload);
      }

    });
  });
};

// Form response processor
app.formResponseProcessor = function(formId,requestPayload,responsePayload){
  var functionToCall = false;
  if(formId == 'accountCreate'){
    // @TODO Do something here now that the account has been created successfully
  }
};

// Init (bootstrapping)
app.init = function(){
  // Bind all form submissions
  app.bindForms();
};

// Call the init processes after the window loads
window.onload = function(){
  app.init();
};
