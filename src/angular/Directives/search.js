var directives = angular.module('directives');

/**
 * Looks for fieldnames inside fields property on the site-specific-config
 * service. Keyed by fieldnames they can have boolean values deteremining
 * whether they are displayed or not.
 */
directives.directive('search', ['$location', '_', 'Search', function($location, _, Search) {
    return {
        restrict: 'E',
        templateUrl: 'views/components/search-box.html',
        link: function(scope, element, attrs) {

            scope.search = function(e) {
                $location.search('search', scope.text);
            };

            scope.clear = function(e) {
                $location.search('search', null);
                $location.search('category', null);
                $location.search('region', null);
                scope.text = '';
            }

            scope.text = $location.search().search || '';
        }
    };
}]);
