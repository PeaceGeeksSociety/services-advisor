var services = angular.module('services'),
    TreeModel = require('tree-model');

services.factory('RegionList', ['$http', 'Language', 'SiteSpecificConfig', '_', function ($http, Language, SiteSpecificConfig, _) {
    var treeconfig = new TreeModel();
    var regionsPromise = null;
    var regionsByIdPromise = {};

    var getRegions = function () {
        if (regionsPromise === null) {
            regionsPromise = $http.get('js/regions_' + Language.getLanguageKey() + '.json').then(function (regions) {
                return treeconfig.parse({ children: regions.data });
            });
        }

        return regionsPromise;
    };

    var getRootRegions = function () {
        return getRegions().then(function (regions) {
            return regions.all(function (node) {
                return node.model.depth == 1;
            });
        });
    };

    var first = function (predicate) {
        return getRegions().then(function (regions) {
            return regions.first(predicate);
        });
    };

    var all = function (predicate) {
        return getRegions().then(function (regions) {
            return regions.all(predicate);
        });
    };

    var walk = function(predicate) {
        return getRegions().then(function (regions) {
            return regions.walk(predicate);
        });
    }

    var find = function (id) {
        if (regionsByIdPromise[id] === undefined) {
            regionsByIdPromise[id] = first(function (node) {
                return node.model.id == id;
            });
        }

        return regionsByIdPromise[id];
    };

    var findAll = function (ids) {
        return all(function (node) {
            return _.contains(ids, node.model.id);
        });
    };

    return {
        get: function (successCb) {
            return getRegions().then(successCb);
        },
        getRootRegions: function (successCb) {
            return getRootRegions().then(successCb);
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
