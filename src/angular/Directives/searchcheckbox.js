var directives = angular.module('directives');

/**
 * Looks for fieldnames inside fields property on the site-specific-config
 * service. Keyed by fieldnames they can have boolean values deteremining
 * whether they are displayed or not.
 */
directives.directive('searchCheckbox', ['$location', '_', function($location, _, Search) {
    return {
        restrict: 'E',
        scope: {
            value: '=',
            namespace: '='
        },
        template: '<input ng-change="toggle()" type="checkbox" ng-model="checked">',
        link: function(scope, element, attrs) {
            scope.toggle = function () {
                var search = $location.search()[scope.namespace] || [];

                // Convert to array if required.
                if (!Array.isArray(search)) {
                    search = [search];
                }

                if (scope.checked) {
                    search.push(scope.value);
                } else {
                    search = _.difference(search, [scope.value]);
                }

                $location.search(scope.namespace, search);
            }

            scope.activeByUrl = function() {
                var search = $location.search()[scope.namespace];

                if (search !== undefined) {
                    if (!Array.isArray(search)) {
                        search = [search];
                    }

                    if (_.contains(search, scope.value)) {
                        return true;
                    }
                }

                return false;
            };

            scope.checked = scope.activeByUrl();
        }
    };
}]);
