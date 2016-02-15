#!/usr/bin/env node

// This script expects a plaintext file of URLs, one per line, that resolve to valid geoJSON.
// The input file will usually be sources.txt; the output file is always compiled.json.
// To run this from the command line, go:
//     cat sources.txt | ./getJSON.js

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

            console.log('Parsing ' + language.name);

            // Parse the JSON objects: create a "Directly accessible" vs "Referral
            // required" field based on "Referral Method"
            var processed = [];

            for (var i in data.nodes) {
                // Check if this node is already in the list.
                nodeID = data.nodes[i].id;

                if (!processed[nodeID]) {
                    // Check if this feature has referral method "No Referral" 
                    referralData = data.nodes[i].node["Referral Method"];

                    /*
                     * There are 7 possible values:
                     *  "Email on a per case basis"
                     *  "Referrals not accepted"       <-- marked as referral-not-required
                     *  "IA Form"
                     *  "Telephone on a per case basis"
                     *  "RAIS"
                     *  "Referral is not required"     <-- marked as referral-not-required
                     *  And not defined at all         <-- marked as referral-not-required
                     *
                     *  The rest are marked as referral-required
                     */
                    var referralStatus = 'referral-required';
                    if (!referralData || referralData["Referrals not accepted"] === true || referralData["Referral is not required"] === true) {
                        referralStatus = 'referral-not-required';
                    }

                    // Create the "noreferral" field with the value of noreferral
                    data.nodes[i].node["Referral required"] = referralStatus;
                    processed[nodeID] = true;
                }
            }

            // Put all the JSON objects into the jsonSources array.
            jsonSources = data.nodes;

            console.log("Writing to " + language.downloaded_json);
            // Write the JSON to the output file
            fs.writeFile(language.downloaded_json, JSON.stringify(jsonSources));
        });
    },
    onError = function (err) {
        throw err;
    };


    for (var i in config.languages) {
      (function (language){
        console.log("Fetching " + language.name);
        var splitUrl = language.url.split("://");
        if (splitUrl[0].toLowerCase() == 'https'){
          $protocol = https;
        } else {
          $protocol = http;
        }
        var req = $protocol.get(language.url, function (res) { onSuccess(res, language); });
        req.on('error', onError);
      })(config.languages[i]);
    }






