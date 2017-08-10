var directives = angular.module('directives');

directives.directive('menuItem', ['$compile', '$location', '_', function($compile, $location, _) {
    return {
        restrict: 'E',
        scope: {
            item: '=',
            type: '='
        },
        templateUrl: 'views/components/menu-item.html',
        link: function (scope, element, attr) {
            scope.active = false;

            scope.name = scope.item.model.name;
            scope.glyph = scope.item.model.glyph;
            scope.count = scope.item.model.count;
            scope.hasChildren = scope.item.hasChildren();

            scope.$watch('item.model.count', function (newValue, oldValue) {
                scope.count = newValue;
            });

            scope.toggle = function() {
                if (scope.active) {
                    scope.deactivate();
                } else {
                    scope.activate();
                }
            };

            scope.activate = function() {
                var path = scope.item.getPath();

                var ids = _.map(path, function (node) {
                    return node.model.id;
                });

                // getPath returns the root of the tree which has no id.
                ids = _.reject(ids, function(item) {
                    return item === undefined;
                });

                $location.search(scope.type, ids);

                if (!scope.item.hasChildren()) {
                    $location.path('/results');
                }
            };

            scope.deactivate = function() {
                if (scope.active) {
                    var search = $location.search()[scope.type];

                    // Collect all heirs ids.
                    var allHeirIds = [];
                    scope.item.walk(function (node) {
                        allHeirIds.push(node.model.id);
                    });

                    // Filter out the current item and heirs.
                    search = _.difference(search, allHeirIds);

                    $location.search(scope.type, search);
                }
            };

            scope.viewResults = function() {
                scope.activate();
                $location.path('/results');
            };

            // if the search query shows this item as active set to active.
            var search = $location.search()[scope.type];

            if (search !== undefined) {
                if (!Array.isArray(search)) {
                    search = [search];
                }

                if (_.contains(search, scope.item.model.id)) {
                    scope.active = true;
                }
            }

            // Prevent deepest items from opening.
            scope.open = scope.active && scope.hasChildren;

            if (scope.item.hasChildren()) {
                element.append("<ul ng-show='active' class='list-group'><li ng-repeat='child in item.children' class='list-group-item'><menu-item item='child' type='type'></menu-item></li></ul>");

                // Recreate the element as a way to remove old event listeners.
                var html = element.html();
                element.contents().remove();
                element.html(html);

                $compile(element.contents())(scope);
            }
        }
    };
}]);
