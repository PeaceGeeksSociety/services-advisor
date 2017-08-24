#!/usr/bin/env node

// Require some node.js modules
var Path = require('path');
var async = require('async');
var Promise = require('bluebird');
var fsWriteFile = Promise.promisify(require('fs').writeFile);
var measureTime = require('measure-time');
var assert = require('./assert');
var config = require('./config');
var sectors = require('./sectors');
var serviceLocations = require('./service-locations');

var APIClient = require('./APIClient');

assert("Config must specify host property", config.host);

var queue = async.queue(function (language, done) {
    // Create a context for data that needs to be shared between transform
    // functions.
    var context = {};

    var langCode = language.toLowerCase();
    var apiClient = new APIClient(config.protocol, config.host, langCode, config.auth);

    log(langCode, 'starting');

    var timer = measureTime();

    Promise.resolve()
        // First fetch sectors, perform transformation and write to file.
        .then(function () {
            return apiClient.fetchJSON('service-sectors')
                .then(function (data) {
                    assert("Sectors JSON data has 'nodes' property", data.nodes);
                    return sectors.transformSectors(data.nodes);
                })
                .then(addToContext('sectors'))
                .then(prettyStringify)
                .then(writeFile('sectors_' + langCode.toUpperCase() + '.json'));
        })
        // First fetch regions, perform transformation and write to file.
        .then(function () {
            return apiClient.fetchAll('api/service_region')
                .then(function (data) {
                    return sectors.transformSectors(data);
                })
                .then(addToContext('regions'))
                .then(prettyStringify)
                .then(writeFile('regions_' + langCode.toUpperCase() + '.json'));
        })
        // Next fetch service partners, save to context.
        .then(function () {
            return apiClient.fetchAll('api/service_partner')
                .then(indexByProperty('id'))
                .then(addToContext('servicePartners'));
                // .then(prettyStringify)
                // .then(writeFile('partners-' + langCode + '.json'));
        })
        // Then fetch service locations, perform transformations (including
        // embedding service partners) and then save to file.
        .then(function () {
            return apiClient.fetchAll('api/service_location')
                .then(addToContext('serviceLocations'))
                .then(function (data) {
                    return serviceLocations.transform(data, context);
                })
                .then(prettyStringify)
                .then(writeFile('services_' + langCode.toUpperCase() + '.json'))
                .then(function () {
                    var elapsed = timer();
                    var numSeconds = (elapsed.millisecondsTotal / 1000);
                    log('\t', "Complete; '"+ langCode +"' services imported in " + numSeconds + " seconds");
                })
        })
        // Finally fetch loacale strings and save to file.
        .then(function () {
            return apiClient.fetchJSON('service-strings')
                .then(addToContext('locale'))
                .then(prettyStringify)
                .then(writeFile('locale-' + langCode.toUpperCase() + '.json'));
        })
        .then(function () {
            // Notify queue tasks complete for language.
            done();
        })
        .catch(function (error) {
            // Notify queue of any errors.
            done(error);
        });

    /**
     * Helper function for managing "global" context state.
     */
    function addToContext(name) {
        return function (data) {
            assert("Context '"+ name +"' cannot be defined", context[name] === undefined);
            context[name] = data;
            return data;
        };
    }
});

queue.error = function (error, langCode) {
    console.error("There was an error fetching Service Locations: '" + error + "' during language: " + langCode);
};

config.languages.forEach(function (language) {
    log(language, "Adding to Service Location fetch queue.");
    queue.push(language);
});

function log(ref, message) {
    console.log("[" + ref + "] " + message);
}

function prettyStringify(value) {
    return JSON.stringify(value, null, '  ');
}

function writeFile(filename) {
    return function (data) {
        var filepath = Path.resolve(__dirname, config.dest, filename);
        log('\t', "writing: " + filepath);
        return fsWriteFile(filepath, data);
    };
}

function indexByProperty(prop) {
    return function (items) {
        return items.reduce(
            function (index, item) {
                assert('Item must have ' + prop + ' property', item[prop]);
                var key = item[prop];
                index[key] = item;
                return index;
            },
            {}
        );
    };
}
