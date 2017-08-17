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
    function fetchWorker(url, done) {
        log('\t', "fetching: " + url);

        var requestOptions = {
            url: url,
            json: true,
            resolveWithFullResponse: true,
            auth: languageInfo.auth
        };

        if (config.api_user) {
            requestOptions.auth = {
                user: config.api_user.user,
                pass: config.api_user.pass
            }
        }

        rp(requestOptions)
            .then(function (response) {
                log("\t", response.statusCode + " response");
                log("\t", "fetched " + response.body.data.length + " items");
                var next = null;
                if (response.body.next) {
                    log("\t", "next: " + response.body.next.href);
                    next = response.body.next.href;
                }
                done(null, response.body.data, next);
            })
            .catch(function (error) {
                // If there's an error notify queue.
                done("'" + error + "' occurred while fetching " + url);
            });
    }

    return runAsyncQueue(fetchWorker, languageInfo.url);
}

var queue = async.queue(function (language, done) {
    log(language.name, 'starting');

    var name = language.name;
    var filepath = Path.resolve(__dirname, language.downloaded_json);
    var timer = measureTime();

    fetchServices(language)
        // We need to flatten results.
        .then(flattenNestedArray)
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

function runAsyncQueue(worker, firstTask) {
    return new Promise(function(resolve, reject) {
        var results = [];
        var queue = async.queue(function(task, completeFn) {
            worker(task, function (error, result, next) {
                if (error) {
                    completeFn(error);
                }
                results.push(result);
                if (next) {
                    queue.push(next);
                    completeFn();
                } else {
                    resolve(results);
                }
            })
        });

        queue.error = function (error, task) {
            log('\t', "ERROR: '" + task + "'");
            reject(error);
        };

        queue.push(firstTask);
    });
}

function log(ref, message) {
    console.log("[" + ref + "] " + message);
}

function prettyStringify(value) {
    return JSON.stringify(value, null, '  ');
}

function flattenNestedArray(arr) {
    return arr.reduce(
        function (flat, nested) {
            return flat.concat(nested);
        },
        []
    );
}
