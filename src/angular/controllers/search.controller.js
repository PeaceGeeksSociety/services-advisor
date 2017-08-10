var controllers = angular.module('controllers');

/**
 * For the category/region search view
 */
controllers.controller('SearchCtrl', ['$scope', '$http', '$location', '$rootScope', 'SiteSpecificConfig', 'ServicesList', 'SectorList', 'Search', '_', '$translate', 'Language', function ($scope, $http, $location, $rootScope, SiteSpecificConfig, ServicesList, SectorList, Search, _, $translate, Language) {

    SectorList.get(function (sectors) {
        $scope.categories = sectors;
    });

    $scope.$on('$locationChangeSuccess', function () {
        Search.filterByUrlParameters();
    });

    $scope.$on('FILTER_CHANGED', function (event, results) {
        var counts = Search.getCategoryGroup.value();

        $scope.categories.walk(function (node) {
            node.model.count = counts[node.model.id] || 0;
        });
    });


}]);
