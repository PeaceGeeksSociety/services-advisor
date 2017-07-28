#!/usr/bin/env node

// Require some node.js modules
var fs = require('fs');
var https = require('https');
var http = require('http');
var split = require('split');
var config = require('./config');

// Array to hold the incoming JSON
var jsonSources = [],
// Given an http GET request, handle the incoming data stream.
onSuccess = function (res, language) {
    var buffers = [];

    // As each chunk of data comes in, store it in an array.
    res.on('data', function (chunk) {
        buffers.push(chunk);
    });

    // Once all the data has come in from this stream...
    res.on('end', function () {
        // Concatenate it into a string.
        var json = Buffer.concat(buffers).toString();

        // Parse the string into JSON objects.
        var data = JSON.parse(json);

        // Write the JSON to the output file
        fs.writeFile(language.locale_file, JSON.stringify(data), function(error) {
            if (error) { throw error; }

            console.log("Writing to " + language.locale_file);
        });
    });
},
onError = function (err) {
    throw err;
};


for (var i in config.languages) {
  (function (language){
    console.log("Fetching " + language.name + " Strings");
    var splitUrl = language.locale_url.split("://");
    if (splitUrl[0].toLowerCase() == 'https'){
      $protocol = https;
    } else {
      $protocol = http;
    }
    var req = $protocol.get(language.locale_url, function (res) { onSuccess(res, language); });
    req.on('error', onError);
  })(config.languages[i]);
}






