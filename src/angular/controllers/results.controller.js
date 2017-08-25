var controllers = angular.module('controllers');

/**
 * For the results view
 */
controllers.controller('ResultsCtrl', ['$scope', '$location', '$translate', '_', 'Search', 'ServicesList', 'SectorList', function ($scope, $location, $translate, _, Search, ServicesList, SectorList) {

    // A bit of a hack to get the services to load before we apply any filter on,
    // ServicesList.get will only load the services if they haven't been loaded already.
    ServicesList.get(
        function(services){
            // ****** RESULTS OBJECT *********
            $scope.results = Search.filterByUrlParameters();
            $scope.count = $scope.results.length;
            var search = $location.search();
            var sectorIds = search.category || [];

            SectorList.findAll(sectorIds, function (sectors) {
                $scope.categories = sectors;
            });
        }
    );

    $scope.getPartnerLogoUrl = function(result) {
        return result.logoUrl;
    };

    // gets the activity details of the service
    $scope.getServicesProvided = function(result){
        return result.servicesProvided || [$translate.instant("UNKNOWN")];
    };

    $scope.selectService = function(service_id) {
        $location.path('services/'+service_id);
    };

    $scope.goBackFromResults = function() {
        $location.path('');
    };
}]);
