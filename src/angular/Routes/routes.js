var basePath = 'views/';
// messing around with getting angular to work side by side with the current app

var servicesAdvisorApp = angular.module('servicesAdvisorApp');


/*** Routing ***/
servicesAdvisorApp.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.

            // home is the category/region search page
            when('/', {
                templateUrl: basePath + 'search.html',
                controller: 'SearchCtrl',
                reloadOnSearch: false
            }).

            // once a category/region is click on, we display the results
            when('/results', {
                templateUrl: basePath + 'search-results.html',
                controller: 'ResultsCtrl'
            }).

            // when you click on a specific service in the result list
            when('/services/:serviceId', {
                templateUrl: basePath + 'service.html',
                controller: 'ServiceCtrl'
            }).

            // the special filters view
            when('/filters', {
                templateUrl: basePath + 'filters.html',
                controller: 'FilterCtrl'
            });
    }]);
/*** End Routing ***/
