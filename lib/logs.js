/* 
 * Library for storing and rotating logs.
 * 
 */ 

// Dependencies
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Container
const lib = {};

// Base dir of log folder
lib.baseDir = path.join(__dirname, '/../.logs/');

// Append a string to a file.
// If the file does not already exist,
// create it.
lib.append = (file, str, cb) => {
    // Open the file for appending
    fs.open(lib.baseDir + file + '.log', 'a', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // Append to file and close it
            fs.appendFile(fileDescriptor, str + '\n', err => {
                if (!err) {
                    fs.close(fileDescriptor, err => {
                        if (!err) {
                            cb(false);
                        } else {
                            cb('Error closing file that was appended');
                        }
                    });
                } else {
                    cb('Error appending to file');
                }
            });
        } else {
            cb('Could not open file for appending');
        }
    });
};

// List all logs, optionally including compressed logs
lib.list = (includeCompressedLogs, cb) => {
    fs.readdir(lib.baseDir, (err, data) => {
        if (!err && data && data.length > 0) {
            const trimmedFileNames = [];
            
            data.forEach(fileName => {
                // Add the .log files
                if (fileName.indexOf('.log') > -1) {
                    trimmedFileNames.push(fileName.replace('.log', ''));
                }

                // Add on .gz.b64 files (if applicable)
                if (fileName.indexOf('.gz.b64') > -1 && includeCompressedLogs) {
                    trimmedFileNames.push(fileName.replace('.gz.b64', ''));
                }
            });

            cb(false, trimmedFileNames);
        } else {
            cb(err, data);
        }
    });
};

// Compress contents of one .log file into a
// .gz.b64 file within the same dir
lib.compress = (logID, newFileID, cb) => {
    const sourceFile = `${logID}.log`;
    const destFile = `${newFileID}.gz.b64`;

    // Read the source file
    fs.readFile(`${lib.baseDir}${sourceFile}`, 'utf8', (err, inputString)=>{
        if (!err && inputString) {
            // Compress data using gzip
            zlib.gzip(inputString, (err, buffer) => {
                if (!err && buffer) {
                    // Send the data to the destination file
                    fs.open(`${lib.baseDir}${destFile}`, 'wx', (err, fileDescriptor) => {
                        if (!err && fileDescriptor) {
                            // Write to destination file
                            fs.writeFile(fileDescriptor, buffer.toString('base64'), err => {
                                if (!err) {
                                    // Close dest file
                                    fs.close(fileDescriptor, err => {
                                        if (!err) {
                                            cb(false);
                                        } else {
                                            cb(err);
                                        }
                                    });
                                } else {
                                    cb(err);
                                }
                            });
                        } else {
                            cb(err)
                        }
                    });
                } else {
                    cb(err);
                }
            });
        } else {
            cb(err);
        }
    });
};

// Decompress the contents of a .gz.b64 file 
// into a string variable
lib.decompress = (fileID, cb) => {
    const fileName = `${fileID}.gz.b64`;
    fs.readFile(lib.baseDir+fileName, 'utf8', (err, str) => {
        if (!err && str) {
            // Decompress the data
            const inputBuffer = Buffer.from(str, 'base64');
            zlib.unzip(inputBuffer, (err, outputBuffer) => {
                if (!err && outputBuffer) {
                    // Callback
                    const outputStr = outputBuffer.toString();
                    cb(false, outputStr);
                } else {
                    cb(err);
                }
            });
        } else {
            cb(err);
        }
    });
};

// Truncate a log file
lib.truncate = (logID, cb) => {
    fs.truncate(`${lib.baseDir}${logID}.log`, 0, err => {
        if (!err) {
            cb(false);
        } else {
            cb(err);
        }
    });
};

// Export
module.exports = lib;