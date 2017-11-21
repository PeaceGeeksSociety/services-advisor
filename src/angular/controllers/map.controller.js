var controllers = angular.module('controllers');

controllers.controller('MapCtrl', [
    '$scope', '$rootScope', '$location', '$translate', 'SiteSpecificConfig', 'ServicesList', 'Search', '_', 'Language', 'Markers', 'Map',
    ($scope, $rootScope, $location, $translate, SiteSpecificConfig, ServicesList, Search, _, Language, Markers, Map) => {

    // TODO: Call this on-demand; when the map is actually visible for first time.
    ServicesList.all().then(initializeMapMarkers);
    $rootScope.$on(
        'FILTER_CHANGED',
        (e, results) => Map.setServiceMarkers(results.map((f) => f.marker))
    );

    function initializeMapMarkers(services) {
        const markers = Markers.createMarkersFromServices(services);
        Map.setServiceMarkers(markers);
    }

}]);
