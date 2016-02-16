#!/usr/bin/env node

// This script expects a plaintext file of URLs, one per line, that resolve to valid geoJSON.
// The input file will usually be sources.txt; the output file is always compiled.json.
// To run this from the command line, go:
//     cat sources.txt | ./getJSON.js

// Require some node.js modules
var fs = require('fs');
var https = require('https');
var split = require('split');

// Array to hold the incoming JSON
var jsonSources = [],
    // Given an http GET request, handle the incoming data stream.
    onSuccess = function (res) {
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

            // Parse the JSON objects: create a "Directly accessible" vs "Referral
            // required" field based on "Referral Method"
            var processed = [];

            for (var i in data.features) {
                // Check if this feature is already in the list.
                featureID = data.features[i].id;

                if (!processed[featureID]) {
                    // Check if this feature has referral method "No Referral" 
                    referralData = data.features[i].properties["10. Referral Method"];


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
                    data.features[i].properties["Referral required"] = referralStatus;
                    processed[featureID] = true;
                }
            }

            // Put all the JSON objects into the jsonSources array.
            jsonSources = jsonSources.concat(data.features);

            // Write the JSON to the output file
            fs.writeFile('services.json', JSON.stringify(jsonSources));
        });
    },
    onError = function (err) {
        throw err;
    };

// Process the input through split() to separate it into individual URLs.
// For each URL, once a single URL has been separated out, GET it.
process.stdin.pipe(split()).on('data', function (url) {
    if (!url) return;
    // Make a GET request to the URL, and run the onSuccess function which parses it and writes out.
    var req = https.get(url, onSuccess);
    req.on('error', onError);
});
