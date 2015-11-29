var controllers = angular.module('controllers');

/**
 * For the results view
 */
controllers.controller('ResultsCtrl', ['$scope', '$location', '$translate', 'Search', 'ServicesList', function ($scope, $location, $translate, Search, ServicesList) {

    // A bit of a hack to get the services to load before we apply any filter on,
    // ServicesList.get will only load the services if they haven't been loaded already.
    ServicesList.get(
        function(services){
            // ****** RESULTS OBJECT *********
            $scope.results = Search.filterByUrlParameters();
        }
    )

    // the methods below serves to get the key value in the object between each ng-repeat loop.
    // The object is passed in from the view, manipulated then returned back.

    // gets the opening time of the service
    $scope.getOpeningTime = function(result){
        //define a variable to store the 'opening time'
        var openingTime = null;

        var timeObject = result.properties[$translate.instant('OFFICE_OPEN_AT')];
        // Run this if the office opening time exists
        if(timeObject){
            // Grabs the key value from the nested object which results in time in string
            openingTime = Object.keys(timeObject)[0];
        }

        return openingTime;
    }

    // gets the closing time of the service
    $scope.getClosingTime = function(result){
        //define a variable to store the 'closing time'
        var closingTime = null;
        var timeObject = result.properties[$translate.instant('OFFICE_CLOSE_AT')];
        // Run this if the office closing time exists
        if(timeObject){
            // Grabs the key value from the nested object which results in time in string
            closingTime = Object.keys(timeObject)[0];
        }

        return closingTime;
    }

    $scope.getPartnerLogoUrl = function(result) {
        var partnerName = result.organization.name.toLowerCase().replace(' ', '');
        return './src/images/partner/' + partnerName + '.jpg';
    };

    // gets the activity details of the service
    $scope.getServicesProvided = function(result){
        return result.servicesProvided || [$translate.instant("UNKNOWN")];
    };

    $scope.selectService = function(service_id) {
        var parameters = $location.search();
        parameters.hideOthers = "true";
        $location.path('services/'+service_id).search(parameters);
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
        }
        $location.path('').search(parameters);
    }
}]);
