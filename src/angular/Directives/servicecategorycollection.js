var directives = angular.module('directives');

directives.directive('serviceCategoryCollection', [function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            collection: '='
        },
        templateUrl: 'src/angular/Views/components/service-category-collection.html',
        link: function (scope, element, attr) {
            var newCollection = scope.collection.slice();
            if (angular.isUndefined(attr.reduce)) {
                attr.reduce = true;
            }

            function reduce(collection) {
                // if depth is 0 or there are no children display it.
                // if there are children flatten them.
                var newCollection = [];

                angular.forEach(collection, function(value, key) {
                    var item = {};
                    item.name = value.name;
                    item.depth = value.depth;
                    item.children = [];

                    if (value.depth === 0 || value.children.length === 0) {
                        newCollection.push(item);
                    }

                    if (value.depth === 0 && value.children.length > 0) {
                        item.children = reduce(value.children);
                    }

                    if (value.depth !== 0 && value.children.length > 0) {
                        newCollection = newCollection.concat(reduce(value.children));
                    }

                });

                return newCollection;
            }

            if (attr.reduce) {
                scope.collection = reduce(newCollection);
            }
        }
    };
}])
.directive('serviceCategoryMember', ['$compile', function($compile) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            member: '='
        },
        template: '<li>{{ member.name }}</li>',
        link: function (scope, element, attrs) {
            if (angular.isArray(scope.member.children)) {
                element.append("<service-category-collection reduce='false' collection='member.children'></service-category-collection>");
                $compile(element.contents())(scope);
            }
        }
    };
}]);