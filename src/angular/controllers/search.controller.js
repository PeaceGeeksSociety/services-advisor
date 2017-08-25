var controllers = angular.module('controllers');

/**
 * For the category/region search view
 */
controllers.controller('SearchCtrl', ['$scope', '$http', '$location', '$rootScope', 'SiteSpecificConfig', 'ServicesList', 'SectorList', 'RegionList', 'Search', '_', '$translate', 'Language', function ($scope, $http, $location, $rootScope, SiteSpecificConfig, ServicesList, SectorList, RegionList, Search, _, $translate, Language) {

    SectorList.get(function (sectors) {
        $scope.categories = sectors;
    });

    RegionList.get(function (regions) {
        $scope.regions = regions;
    });

    $scope.$on('$locationChangeSuccess', function () {
        // Only filter results if we stay on front route.
        if ($location.path() === '/') {
            Search.filterByUrlParameters();
        }
    });

    $scope.$on('FILTER_CHANGED', function (event, results) {
        var categoryCounts = Search.getCategoryGroup.value();
        var regionCounts = Search.getRegionGroup.value();

        $scope.categories.walk(function (node) {
            node.model.count = categoryCounts[node.model.id] || 0;
        });

        $scope.regions.walk(function (node) {
            node.model.count = regionCounts[node.model.id] || 0;
        });
    });

}]);
