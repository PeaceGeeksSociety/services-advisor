var directives = angular.module('directives');

directives.directive('menuItem', ['$compile', '$location', '_', function($compile, $location, _) {
    return {
        restrict: 'E',
        scope: {
            item: '=',
            type: '='
        },
        templateUrl: 'views/components/menu-item.html',

        link(scope, element, attr) {
            let renderedChildren = false;

            scope.active = false;
            scope.name = scope.item.model.name;
            scope.glyph = scope.item.model.glyph || null;
            scope.markerColor = scope.item.model.markerColor;
            scope.count = scope.item.model.count;
            scope.hasChildren = scope.item.hasChildren();
            scope.openClass = 'glyphicon-chevron-right';
            scope.$watch('item.model.count', onItemCount);
            scope.toggle = onToggle;
            scope.activate = activate;
            scope.deactivate = deactivate;
            scope.viewResults = viewResults;
            scope.$on('$locationChangeSuccess', onLocationChangeSuccess);
            scope.activeByUrl = activeByUrl;
            scope.getUrlState = getUrlState;
            scope.getUrlState();

            function onItemCount(newValue, oldValue) {
                scope.count = newValue;
            }

            function onToggle() {
                if (scope.active) {
                    scope.deactivate();
                } else {
                    scope.activate();
                }
            }

            function renderChildren() {
                if (!renderedChildren && scope.item.hasChildren()) {
                    renderedChildren = true;
                    element.append("<ul ng-show='active' class='list-group'><li ng-repeat='child in item.children' class='list-group-item'><menu-item item='child' type='type'></menu-item></li></ul>");
                    // Recreate the element as a way to remove old event listeners.
                    var html = element.html();
                    element.contents().remove();
                    element.html(html);
                    $compile(element.contents())(scope);
                }
            }

            function activate() {
                if (!scope.active) {
                    var path = scope.item.getPath();

                    var ids = _.map(path, (node) => {
                        return node.model.id;
                    });

                    // getPath returns the root of the tree which has no id.
                    ids = _.reject(ids, (item) => {
                        return item === undefined;
                    });

                    $location.search(scope.type, ids);

                    if (!scope.item.hasChildren()) {
                        $location.path('/results');
                    } else {
                        // Prevent deepest items from opening.
                        renderChildren()
                        scope.openClass = 'glyphicon-chevron-down';
                    }

                    scope.active = true;
                }
            }

            function deactivate() {
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

                    scope.active = false;
                    scope.openClass = 'glyphicon-chevron-right';
                }
            }

            function viewResults() {
                scope.activate();
                $location.path('/results');
            }

            function onLocationChangeSuccess() {
                // if the search query shows this item as active set to active.
                scope.getUrlState();
            }

            function activeByUrl() {
                var search = $location.search()[scope.type];
                if (search !== undefined) {
                    if (!Array.isArray(search)) {
                        search = [search];
                    }
                    if (_.contains(search, scope.item.model.id)) {
                        return true;
                    }
                }
                return false;
            }

            function getUrlState() {
                if (scope.activeByUrl()) {
                    scope.activate();
                } else {
                    scope.deactivate();
                }
            }
        }
    };
}]);
