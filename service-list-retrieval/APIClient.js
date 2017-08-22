var Path = require('path');
var URL = require('url');
var Promise = require('bluebird');
var async = require('async');
var rp = require('request-promise');
var assert = require('./assert');

function APIClient(protocol, host, langCode, auth) {
    this.protocol = protocol || 'http';
    this.host = host;
    this.langCode = langCode || "";
    this.auth = auth || null;
}

APIClient.prototype.getURL = function (endpoint) {
    return URL.format({
        protocol: this.protocol,
        host: this.host,
        pathname: Path.join('/', this.langCode, endpoint)
    });
};

APIClient.prototype.fetchAll = function (endpoint) {
    var fetchJSON = this._fetchJSON.bind(this);
    var url = this.getURL(endpoint);

    return runAsyncQueue(url, worker)
        // We need to flatten results.
        .then(flattenNestedArray);

    function worker(url, done) {
        fetchJSON(url)
            .then(function (response) {
                log("\t", response.statusCode + " response");

                // log("\t", "URL: " + url);
                // log("\t", "RESPONSE: " + JSON.stringify(response, null, '\t'));

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
};

APIClient.prototype.fetchJSON = function (endpoint) {
    var url = this.getURL(endpoint);
    return this._fetchJSON(url)
        .then(function (response) {
            log("\t", response.statusCode + " response");
            assert('Response is 200', response.statusCode === 200);
            return response.body;
        });
};

APIClient.prototype._fetchJSON = function (url) {
    log('\t', "fetching: " + url);

    var requestOptions = {
        url: url,
        json: true,
        resolveWithFullResponse: true
    };
    if (this.auth) {
        requestOptions.auth = this.auth
    }

    return rp(requestOptions);
}

function runAsyncQueue(firstTask, worker) {
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

function flattenNestedArray(arr) {
    return arr.reduce(
        function (flat, nested) {
            return flat.concat(nested);
        },
        []
    );
}

module.exports = APIClient;
