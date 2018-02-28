var controllers = angular.module('controllers');

controllers.controller('MapCtrl', [
    '$scope', '$rootScope', '$location', '$translate', 'SiteSpecificConfig', 'ServicesList', 'Search', '_', 'Language', 'Markers', 'Map',
    ($scope, $rootScope, $location, $translate, SiteSpecificConfig, ServicesList, Search, _, Language, Markers, Map) => {

    // TODO: Call this on-demand; when the map is actually visible for first time.
    ServicesList.all()
        .then(initializeMapMarkers)
        .then(initializeMapBounds);
    $rootScope.$on(
        'FILTER_CHANGED',
        (e, results) => Map.setServiceMarkers(results.map((f) => f.marker))
    );

    function initializeMapMarkers(services) {
        const markers = Markers.createMarkersFromServices(services);
        Map.setServiceMarkers(markers);
    }

    function initializeMapBounds() {
        // On initial load see if we have bounding box info on the query string.
        // If yes, use it and then unset it.
        // If no, we'll user the points to fix to zoom.
        var parameters = $location.search();
        if (parameters.hasOwnProperty('bbox')) {
            const bbox = JSON.parse(decodeURI(parameters.bbox));
            Map.fitBounds([
                [bbox._northEast.lat, bbox._northEast.lng],
                [bbox._southWest.lat, bbox._southWest.lng]
            ]);
        }
    }

}]);
