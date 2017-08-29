var directives = angular.module('directives');

/**
 * Looks for fieldnames inside fields property on the site-specific-config
 * service. Keyed by fieldnames they can have boolean values deteremining
 * whether they are displayed or not.
 */
directives.directive('collapsible', [function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            label: '=',
            collapsed: '='
        },
        templateUrl: 'views/components/collapsible.html',
        link: function(scope, element, attrs) {
            scope.toggle = function() {
                scope.collapsed = !scope.collapsed;
            }
        }
    };
}]);
