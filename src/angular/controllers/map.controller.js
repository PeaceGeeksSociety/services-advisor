var controllers = angular.module('controllers');

controllers.controller('MapCtrl', [
    '$scope', '$rootScope', '$location', '$translate', 'SiteSpecificConfig', 'ServicesList', 'Search', '_', 'Language', 'Markers', 'Map',
    ($scope, $rootScope, $location, $translate, SiteSpecificConfig, ServicesList, Search, _, Language, Markers, Map) => {

    // TODO: Call this on-demand; when the map is actually visible for first time.
    initializeMapMarkers();

    function initializeMapMarkers() {
        ServicesList.all().then((services) => {
            const markers = Markers.createMarkersFromServices(services);
            Map.setServiceMarkers(markers);
            $rootScope.$on('FILTER_CHANGED', onFilterChanged);
        });
    }

    function onFilterChanged(event, results) {
        Map.setServiceMarkers(results.map((f) => f.marker))
    }

}]);
