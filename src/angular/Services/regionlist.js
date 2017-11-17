var services = angular.module('services'),
    TreeModel = require('tree-model');

services.factory('RegionList', [
    '$http', 'Language', '_',
    ($http, Language, _) => {

    var treeconfig = new TreeModel();
    var regionsPromise = null;
    var regionsByIdPromise = {};

    return {
        get(successCb) {
            return getRegions().then(successCb);
        },
        getRootRegions(successCb) {
            return getRootRegions().then(successCb);
        },
        first(predicate, successCb) {
            return first(predicate).then(successCb);
        },
        all(predicate, successCb) {
            return all(predicate).then(successCb);
        },
        walk(predicate, successCb) {
            return walk(predicate).then(successCb);
        },
        find(id, successCb) {
            return find(id).then(successCb);
        },
        findAll(ids, successCb) {
            return findAll(ids).then(successCb);
        }
    };

    function getRegions() {
        if (regionsPromise === null) {
            regionsPromise = $http.get('js/regions_' + Language.getLanguageKey() + '.json')
                .then((response) => treeconfig.parse({ children: response.data }));
        }
        return regionsPromise;
    }

    function getRootRegions() {
        return getRegions().then(function (regions) {
            return regions.all(function (node) {
                return node.model.depth == 1;
            });
        });
    }

    function first(predicate) {
        return getRegions().then(function (regions) {
            return regions.first(predicate);
        });
    }

    function all(predicate) {
        return getRegions().then(function (regions) {
            return regions.all(predicate);
        });
    }

    function walk(predicate) {
        return getRegions().then(function (regions) {
            return regions.walk(predicate);
        });
    }

    function find(id) {
        if (regionsByIdPromise[id] === undefined) {
            regionsByIdPromise[id] = first(function (node) {
                return node.model.id == id;
            });
        }

        return regionsByIdPromise[id];
    }

    function findAll(ids) {
        return all(function (node) {
            return _.contains(ids, node.model.id);
        });
    }
}]);
