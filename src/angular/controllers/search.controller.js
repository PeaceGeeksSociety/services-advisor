var controllers = angular.module('controllers');

/**
 * For the category/region search view
 */
controllers.controller('SearchCtrl', ['$scope', '$http', '$location', '$rootScope', 'SiteSpecificConfig', 'ServicesList', 'SectorList', 'RegionList', 'Search', '_', '$translate', 'Language', function ($scope, $http, $location, $rootScope, SiteSpecificConfig, ServicesList, SectorList, RegionList, Search, _, $translate, Language) {
    $scope.organizations = {};

    SectorList.get(function (sectors) {
        $scope.categories = sectors;
    });

    RegionList.get(function (regions) {
        $scope.regions = regions;
    });

    ServicesList.get(function (services) {
        _.each(services, function (service) {
            $scope.organizations[service.organization.name] = { name: service.organization.name, logoUrl: service.logoUrl };
        });
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

    // toggle selection for a given organization by name
    $scope.toggleSelection = function(organization) {
        var parameters = $location.search();

        if (_.has(parameters, 'organization')) {
            var organizations = typeof(parameters.organization) == "string" ? parameters.organization.split(',') : parameters.organization;
            var idx = organizations.indexOf(organization);

            // is currently selected - splice that organization from selected array
            if (idx > -1) {
                organizations.splice(idx, 1);
            }
            // is newly selected - push organization into the selection array
            else {
                organizations.push(organization);
            }
            parameters.organization = organizations;
        } else {
            parameters.organization = [organization];
        }
        // still binding the pills to filterSeletion.
        $rootScope.filterSelection = parameters.organization;
        $location.search(parameters);
        Search.filterByUrlParameters();
    };
}]);
