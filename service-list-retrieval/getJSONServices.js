#!/usr/bin/env node

// Require some node.js modules
var fs = require('fs');
var rp = require('request-promise');
var Promise = require('bluebird');
var measureTime = require('measure-time');
var config = require('./config');

function getLanguage(language) {
    var options = {
        timer: measureTime(),
        language: language,
        current_page: 0,
        items_per_page: null,
        last_page: 0,
        total_items: null,
    };

    return new Promise(function (resolve, reject) {
        console.log('Starting ' + language.name);
        getRequest(options).then(function (results) {
            var elapsed = options.timer();

            fs.writeFile(language.downloaded_json, JSON.stringify(results), function (error) {
                resolve(results.length + "/" + options.total_items + " " + language.name + " services imported in " + (elapsed.millisecondsTotal / 1000) + " seconds.");
            });
        });
    });
}

function getRequest(config) {
    var get = function(config, page) {
        console.log('Running ' + config.language.name + ' page: ' + page);
        var options = {
            uri: config.language.url,
            qs: {
                page: page
            },
            transform: function(body, response, resolveWithFullResponse) {
                config.current_page   = response.headers['x-pager-current_page'];
                config.items_per_page = response.headers['x-pager-items_per_page'];
                config.last_page      = response.headers['x-pager-last_page'];
                config.total_items    = response.headers['x-pager-total_items'];

                return body.data;
            },
            json: true
        };

        return rp(options).then(function (results) {
            console.log('Finished running page: ' + page);
            return results;
        });
    };

    var results = [];

    return get(config, 0).then(function (response) {
        var chain = [];
        results = results.concat(response);

        for (var j = 1; j <= config.last_page; j++) {
            chain.push({
                page: j,
                callback: function (pageNum) {
                    return get(config, pageNum);
                }
            });
        }

        return chain;
    }).then(function (chain) {
        return Promise.each(chain, function (obj) {
            return obj.callback(obj.page).then(function (response) {
                results = results.concat(response);
            });
        });
    }).then(function () {
        return results;
    });
}

var chain = [];

for (var i in config.languages) {
    (function (chain, language) {
        chain.push(function() {
            return getLanguage(language);
        });
    })(chain, config.languages[i]);
}

Promise.each(chain, function(cb) {

    return cb().then(function(response) {
        console.log(response);
    });

}).catch(console.log.bind(console));
