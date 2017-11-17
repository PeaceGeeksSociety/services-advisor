// Mapbox doesn't need its own var - it automatically attaches to Leaflet's L.
require('mapbox.js');
// Use Awesome Markers lib to produce font-icon map markers
require('drmonty-leaflet-awesome-markers');
// Marker clustering
require('leaflet.markercluster');

var VersionControl = require('./../../utility/leaflet-version-control.js');

// Configurable cluster icon colors.
require('./../../utility/leaflet-divicon-color.js');

var controllers = angular.module('controllers');

controllers.controller('MapCtrl', [
    '$scope', '$rootScope', '$location', '$translate', 'SiteSpecificConfig', 'ServicesList', 'Search', '_', 'Language', 'Markers', 'Map',
    ($scope, $rootScope, $location, $translate, SiteSpecificConfig, ServicesList, Search, _, Language, Markers, Map) => {

    // initializeMapMarkers();

    function initializeMapMarkers() {
        ServicesList.all().then((services) => {
            const markers = Markers.createMarkersFromServices(services);
            Map.setServiceMarkers(markers);
            $rootScope.$on('FILTER_CHANGED', onFilterChanged);
        });
    }

    function onFilterChanged(event, results) {
        // Clear all the map markers.
        console.log('[map.controller.js:onFilterChanged()]');
        // Add the new result's markers back to the map.
        Map.setServiceMarkers(results.map((f) => f.marker))
    }

}]);
