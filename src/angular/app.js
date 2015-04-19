var basePath = 'src/angular/';

// messing around with getting angular to work side by side with the current app
var servicesAdvisorApp = angular.module('servicesAdvisorApp', ['ngRoute', 'controllers', 'services']);


/*** Routing ***/
servicesAdvisorApp.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.

            // home is the category/region search page
            when('/', {
                templateUrl: basePath + 'partials/search.html',
                controller: 'SearchCtrl'
            }).

            // once a category/region is click on, we display the results
            when('/results', {
                templateUrl: basePath + 'partials/search-results.html',
                controller: 'ResultsCtrl'
            }).

            // when you click on a specific service in the result list
            when('/services/:serviceId', {
                templateUrl: basePath + 'partials/service.html',
                controller: 'ServiceCtrl'
            }).

            // the special filters view
            when('/filters', {
                templateUrl: basePath + 'partials/filters.html',
                controller: 'FilterCtrl'
            });
    }]);
/*** End Routing ***/






/*** Services ***/
var services = angular.module('services', ['ngResource']);

/**
 * Provides the list of services (compiled.json)
 */
services.factory('ServicesList', ['$resource', function ($resource) {
    return $resource('src/compiled.json', {}, {
        get: {method: 'GET', isArray: true, cache: true}
    });
}]);

/**
 * Holds the state of the current search and the current results of that search
 */
services.factory('Search', ['ServicesList', function(ServicesList) {
    var allServices = ServicesList.get();

    // search will contain the current search params.
    // ex: { category: 'a', region: 'b', organization: 'c', query: 'd' }
    var search = {};

    return {
        search: search,
        currResults: function () {
            return allServices; // TODO: implement. Right now we don't return search results, just all the services
        }
    }
}]);

/*** End Services ***/





/*** Controllers ***/
var controllers = angular.module('controllers', []);

/**
 * For the category/region search view
 */
controllers.controller('SearchCtrl', ['$scope', '$http', 'ServicesList', 'Search', function ($scope, $http, ServicesList, Search) {

    ServicesList.get(function (data) {
        $scope.services = data;

        // Here we're going to extract the list of categories and display them in a simple template

        // use an object to collect categories of services since object keys won't allow
        // for duplicates (this basically acts as a set)
        var categories = {};
        $.each(data, function (index, service) {
            var category = service.properties.activityName;
            if (category) {
                categories[category] = true;
            }
        });

        // now to get an array of categories we just map over the keys of the object
        $scope.categories = $.map(categories, function (element, index) {
            return index
        });
    });

    $scope.selectCategory = function (category) {
        Search.search.category = category;
    }
}]);


/**
 * For the results view
 */
controllers.controller('ResultsCtrl', ['$scope', 'Search', function ($scope, Search) {
    $scope.results = Search.currResults();
}]);

/*** End Controllers ***/
