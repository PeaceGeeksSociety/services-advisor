#!/usr/bin/env node


// Require some node.js modules
var _ = require('underscore');
var fs = require('fs');
var https = require('https');
var http = require('http');
var split = require('split');
var config = require('./config');

// Able to travel the entire sector tree.
var findSectorById = function(tree, id) {
    // Check for top level elements.
    var found = _.find(tree, function(v) {
        if (v.id === id) { return v; }
    });

    if (found) { return found; }
    // If no top level elements match start going through children.
    else {
        _.some(tree, function(v) {
            found = findSectorById(v.children, id);
            if (found) { return true; }
        });
    }

    return found || null;
};

function Sector(source) {
    this.id       = source.id;
    this.parentId = source.parentId;
    this.depth    = source.depth;
    this.name     = source.name;
    this.weight   = source.weight;
    this.active   = false;
    this.glyph    = source.glyph || null;
    this.markerColor = source.markerColor || null;
    this.children = [];
}

Sector.prototype.addParent = function(parent) {
    parent.children.push(this);

    if (!this.glyph) {
        this.glyph = parent.glyph;
    }

    if (!this.markerColor) {
        this.markerColor = parent.markerColor;
    }
};

var transformSectors = function(rawSectors) {
    var set = [];
    _.each(rawSectors, function(rawSector) {
        var sector = new Sector(rawSector);

        if (sector.depth > 1) {
            var parent = findSectorById(set, sector.parentId);
            if (parent) {
                sector.addParent(parent);
            }
        } else {
            set.push(sector);
        }
    });

    return set;
};

// Array to hold the incoming JSON
var jsonSources = [],
    processLanguage = function (language){
        console.log("Fetching " + language.name + ' Sectors');
        var splitUrl = language.sectors_url.split("://");
        var $protocol = http;
        if (splitUrl[0].toLowerCase() == 'https'){
            $protocol = https;
        }

        var req = $protocol.get(language.sectors_url, function (res) { onSuccess(res, language); });
        req.on('error', onError);
    },
    // Given an http GET request, handle the incoming data stream.
    onSuccess = function (res, language) {
        var buffers = [];

        // As each chunk of data comes in, store it in an array.
        res.on('data', function (chunk) {
            buffers.push(chunk);
        });

        res.on('end', function () {
            // Concatenate it into a string.
            var json = Buffer.concat(buffers).toString();
            // Parse the string into JSON objects.
            var data = JSON.parse(json);
            // Parse the objects.
            var jsonSources = transformSectors(data.nodes);

            // Write the JSON to the output file
            fs.writeFile(language.sectors_file, JSON.stringify(jsonSources), function(error) {
                if (error) { throw error; }

                console.log("Writing to " + language.sectors_file);
            });
        });
    },
    onError = function (err) {
        throw err;
    };


    for (var i in config.languages) {
        processLanguage(config.languages[i]);
    }






