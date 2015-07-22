var basePath = 'src/angular/';
// messing around with getting angular to work side by side with the current app

var servicesAdvisorApp = angular.module('servicesAdvisorApp');


/*** Routing ***/
servicesAdvisorApp.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.

            // home is the category/region search page
            when('/', {
                templateUrl: basePath + 'Views/search.html',
                controller: 'SearchCtrl'
            }).

            // once a category/region is click on, we display the results
            when('/results', {
                templateUrl: basePath + 'Views/search-results.html',
                controller: 'ResultsCtrl'
            }).

            // when you click on a specific service in the result list
            when('/services/:serviceId', {
                templateUrl: basePath + 'Views/service.html',
                controller: 'ServiceCtrl'
            }).

            // the special filters view
            when('/filters', {
                templateUrl: basePath + 'Views/filters.html',
                controller: 'FilterCtrl'
            });
    }]);
/*** End Routing ***/
