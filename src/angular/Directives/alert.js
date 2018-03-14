var directives = angular.module('directives');

/**
 * Looks for fieldnames inside fields property on the site-specific-config
 * service. Keyed by fieldnames they can have boolean values deteremining
 * whether they are displayed or not.
 */
directives.directive('alert', [function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            type: '=',
            closeable: '='
        },
        templateUrl: 'views/components/alert.html',
        link: function(scope, element, attrs) {
            if (scope.closeable === undefined) {
                scope.closeable = false;
            }
        }
    };
}]);
