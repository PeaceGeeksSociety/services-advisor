var directives = angular.module('directives');

directives.directive('serviceCategoryCollection', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            collection: '='
        },
        templateUrl: 'src/angular/Views/components/service-category-collection.html'
    };
})
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
                element.append("<service-category-collection collection='member.children'></service-category-collection>");
                $compile(element.contents())(scope);
            }
        }
    };
}]);