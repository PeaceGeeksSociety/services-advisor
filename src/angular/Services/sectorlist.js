var services = angular.module('services'),
    TreeModel = require('tree-model');

services.factory('SectorList', ['$http', 'Language', 'SiteSpecificConfig', function ($http, Language, SiteSpecificConfig) {
    var treeconfig = new TreeModel();
    var sectorsPromise = null;

    var getSectors = function() {
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

    var getRootSectors = function() {
        return getSectors().then(function (sectors) {
            return sectors.all(function (node) {
                return node.model.depth == 1;
            });
        });
    };

    return {
        get: function (successCb) {
            return getSectors().then(successCb);
        },
        getRootSectors: function (successCb) {
            return getRootSectors().then(successCb);
        }
    };
}]);
