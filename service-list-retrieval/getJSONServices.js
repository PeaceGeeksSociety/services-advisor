#!/usr/bin/env node

// Require some node.js modules
var Path = require('path');
var rp = require('request-promise');
var async = require('async');
var Promise = require('bluebird');
var fsWriteFile = Promise.promisify(require('fs').writeFile);
var measureTime = require('measure-time');
var config = require('./config');

function fetchServices(languageInfo) {
    var results = [];

    return new Promise(function(resolve, reject) {
        var queue = async.queue(fetchWorker);

        queue.error = function (error, url) {
            log('\t', "ERROR: '" + url + "'");
            reject("'" + error + "' occurred while fetching " + url);
        };

        queue.push(languageInfo.url);

        function fetchWorker(url, done) {
            log('\t', "fetching: " + url);

            var requestOptions = {
                url: url,
                json: true,
                resolveWithFullResponse: true
            };

            rp(requestOptions)
                .then(function (response) {
                    log("\t", response.statusCode + " response");
                    // Collecting results.
                    results = results.concat(response.body.data);

                    log("\t", "fetched " + response.body.data.length + " items. Total fetched: " + results.length + "/" + response.body.count + " items" + "\nDATA:\t" + prettyStringify(response.body.data.map(function (item, count) {return count +': '+ item.serviceName;})));

                    // If there's more results, add next url to queue.
                    if (response.body.next) {
                        log("\t", "next: " + response.body.next.href);
                        queue.push(response.body.next.href);
                        done();
                    } else {
                        // Finish queue.
                        queue.kill();
                        resolve(results);
                    }
                })
                .catch(function (error) {
                    // If there's an error notify queue.
                    done(error);
                });
        }
    });
}

var queue = async.queue(function (language, done) {
    log(language.name, 'starting');

    var name = language.name;
    var filepath = Path.resolve(__dirname, language.downloaded_json);
    var timer = measureTime();

    fetchServices(language)
        .then(prettyStringify)
        .then(function (data) {
            log(language.name, "writing: " + filepath);
            return fsWriteFile(filepath, data);
        })
        .then(function () {
            var elapsed = timer();
            var numSeconds = (elapsed.millisecondsTotal / 1000);
            log(name, "complete; services imported in " + numSeconds + " seconds");
            done();
        })
        .catch(function (error) {
            done(error);
        });
});

queue.error = function (error, language) {
    console.error("There was an error fetching Service Locations: '" + error + "' during language: " + language.name);
};

config.languages.forEach(function (language) {
    console.log("Adding " + language.name + " to Service Location fetch queue.");
    queue.push(language);
});

function log(ref, message) {
    console.log("[" + ref + "] " + message);
}

function prettyStringify(value) {
    return JSON.stringify(value, null, '  ');
}
