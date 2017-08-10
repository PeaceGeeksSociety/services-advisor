var directives = angular.module('directives');

directives.directive('serviceCategorySummary', ['SectorList', '_', function(SectorList, _) {
    return {
        restrict: 'E',
        scope: {
            collection: '='
        },
        templateUrl: 'views/components/service-category-summary.html',
        link: function (scope, element, attr) {
            scope.$watch('collection', function () {
                scope.items = [];

                SectorList.findAll(scope.collection, function (sectors) {
                    _.each(sectors, function (node) {
                        if (node.model.depth == 1 || !node.hasChildren()) {
                            scope.items.push(node);
                        }
                    });
                });
            });
        }
    };
}]);
