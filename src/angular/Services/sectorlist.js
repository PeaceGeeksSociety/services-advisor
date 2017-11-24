var services = angular.module('services'),
    TreeModel = require('tree-model');

services.factory('SectorList', [
    '$http', 'LongTask', 'Language', '_',
    ($http, LongTask, Language, _) => {

    var treeconfig = new TreeModel();
    var sectorsPromise = null;
    var sectorsByIdPromise = {};

    LongTask.run(getSectors);

    return {
        get(successCb) {
            return getSectors().then(successCb);
        },
        getRootSectors(successCb) {
            return getRootSectors().then(successCb);
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

    function getSectors() {
        if (sectorsPromise === null) {
            sectorsPromise = $http.get('js/sectors_' + Language.getLanguageKey() + '.json')
                .then((response) => {
                    response.data.forEach(createSectorIcon);
                    return treeconfig.parse({children: response.data});
                });
        }

        return sectorsPromise;
    }

    function getRootSectors() {
        return getSectors().then(function (sectors) {
            return sectors.all(function (node) {
                return node.model.depth == 1;
            });
        });
    }

    function createSectorIcon(sector) {
        sector.icon = L.AwesomeMarkers.icon({
            icon: sector.glyph,
            prefix: 'icon', // necessary because Humanitarian Fonts prefixes its icon names with "icon"
            iconColor: sector.markerColor,
            markerColor: "white",
            extraClasses: sector.name
        });
        return sector;
    }

    function first(predicate) {
        return getSectors().then(function (sectors) {
            return sectors.first(predicate);
        });
    }

    function all(predicate) {
        return getSectors().then(function (sectors) {
            return sectors.all(predicate);
        });
    }

    function walk(predicate) {
        return getSectors().then(function (sectors) {
            return sectors.walk(predicate);
        });
    }

    function find(id) {
        if (sectorsByIdPromise[id] === undefined) {
            sectorsByIdPromise[id] = first(function (node) {
                return node.model.id == id;
            });
        }

        return sectorsByIdPromise[id];
    }

    function findAll(ids) {
        return all(function (node) {
            return _.contains(ids, node.model.id);
        });
    }
}]);
