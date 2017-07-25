var controllers = angular.module('controllers');

/**
 * For the results view
 */
controllers.controller('ResultsCtrl', ['$scope', '$location', '$translate', '_', 'Search', 'ServicesList', function ($scope, $location, $translate, _, Search, ServicesList) {

    // A bit of a hack to get the services to load before we apply any filter on,
    // ServicesList.get will only load the services if they haven't been loaded already.
    ServicesList.get(
        function(services){
            // ****** RESULTS OBJECT *********
            $scope.results = Search.filterByUrlParameters();
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
        var parameters = $location.search();
        if (_.has(parameters, 'category')){
            delete parameters.category;
            // refilter as we changed the parameters.
            Search.filterByUrlParameters();
        } else if (_.has(parameters, 'region')){
            delete parameters.region;
            // refilter as we changed the parameters.
            Search.filterByUrlParameters();
        } else if (_.has(parameters, 'sector')){
            delete parameters.sector;
            // refilter as we changed the parameters.
            Search.filterByUrlParameters();
        }
        $location.path('').search(parameters);
    };
}]);
