var services = angular.module('services'),
    TreeModel = require('tree-model');

services.factory('SectorList', ['$http', 'Language', '_', function ($http, Language, _) {
    var treeconfig = new TreeModel();
    var sectorsPromise = null;
    var sectorsByIdPromise = {};

    var getSectors = function () {
        if (sectorsPromise === null) {
            sectorsPromise = $http.get('js/sectors_' + Language.getLanguageKey() + '.json').then(function (sectors) {
                angular.forEach(sectors.data, function (sector) {
                    sector.icon = L.AwesomeMarkers.icon({
                        icon: sector.glyph,
                        prefix: 'icon', // necessary because Humanitarian Fonts prefixes its icon names with "icon"
                        iconColor: sector.markerColor,
                        markerColor: "white",
                        extraClasses: sector.name
                    });
                });

                return treeconfig.parse({ children: sectors.data });
            });
        }

        return sectorsPromise;
    };

    var getRootSectors = function () {
        return getSectors().then(function (sectors) {
            return sectors.all(function (node) {
                return node.model.depth == 1;
            });
        });
    };

    var first = function (predicate) {
        return getSectors().then(function (sectors) {
            return sectors.first(predicate);
        });
    };

    var all = function (predicate) {
        return getSectors().then(function (sectors) {
            return sectors.all(predicate);
        });
    };

    var walk = function(predicate) {
        return getSectors().then(function (sectors) {
            return sectors.walk(predicate);
        });
    }

    var find = function (id) {
        if (sectorsByIdPromise[id] === undefined) {
            sectorsByIdPromise[id] = first(function (node) {
                return node.model.id == id;
            });
        }

        return sectorsByIdPromise[id];
    };

    var findAll = function (ids) {
        return all(function (node) {
            return _.contains(ids, node.model.id);
        });
    };

    return {
        get: function (successCb) {
            return getSectors().then(successCb);
        },
        getRootSectors: function (successCb) {
            return getRootSectors().then(successCb);
        },
        first: function(predicate, successCb) {
            return first(predicate).then(successCb);
        },
        all: function(predicate, successCb) {
            return all(predicate).then(successCb);
        },
        walk: function(predicate, successCb) {
            return walk(predicate).then(successCb);
        },
        find: function (id, successCb) {
            return find(id).then(successCb);
        },
        findAll: function (ids, successCb) {
            return findAll(ids).then(successCb);
        },
    };
}]);
