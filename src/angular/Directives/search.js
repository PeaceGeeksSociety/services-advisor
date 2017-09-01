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
                e.preventDefault();
                if (scope.text.length > 0) {
                    $location.search('search', scope.text);
                } else {
                    $location.search('search', null);
                }
            };

            scope.clear = function(e) {
                e.preventDefault();
                $location.search('search', null);
                $location.search('category', null);
                $location.search('region', null);
                scope.text = '';
            }

            scope.text = $location.search().search || '';
        }
    };
}]);
