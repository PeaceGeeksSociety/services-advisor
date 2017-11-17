var controllers = angular.module('controllers');

/**
 * For the category/region search view
 */
controllers.controller(
    'SearchCtrl',
    ['$scope', '$http', '$location', '$rootScope', 'SiteSpecificConfig', 'ServicesList', 'SectorList', 'RegionList', 'Search', '_', '$translate', 'Language',
    ($scope, $http, $location, $rootScope, SiteSpecificConfig, ServicesList, SectorList, RegionList, Search, _, $translate, Language) => {

    $scope.feedbackMail = SiteSpecificConfig.feedbackMail;

    // $scope.organizations = {};

    const awaitData = Promise.all([RegionList.get(), SectorList.get(), ServicesList.get()]).then(setScopeData);

    $scope.$on('$locationChangeSuccess', onLocationChangeSuccess);
    $scope.$on('FILTER_CHANGED', onFilterChanged);
    // toggle selection for a given organization by name
    $scope.toggleSelection = toggleSelection;

    function setScopeData([regions, sectors, services]) {
        $scope.regions = regions;
        $scope.categories = sectors;
        $scope.organizations = services.reduce((organizations, service) => {
            const {organization: {name}, logoUrl} = service;
            if (!organizations.hasOwnProperty(name)) {
                organizations[name] = {name, logoUrl};
            }
            return organizations;
        }, {});
        return [regions, sectors, services];
    }

    function onLocationChangeSuccess() {
        // Only filter results if we stay on front route.
        if ($location.path() === '/') {
            Search.filterByUrlParameters();
        }
    }

    function onFilterChanged(event, results) {
        var categoryCounts = Search.getCategoryGroup.value();
        var regionCounts = Search.getRegionGroup.value();

        awaitData.then(([regions, sectors, services]) => {
            // sectors.walk((node) => {
            $scope.categories.walk((node) => {
                node.model.count = categoryCounts[node.model.id] || 0;
            });
            // regions.walk((node) => {
            $scope.regions.walk((node) => {
                node.model.count = regionCounts[node.model.id] || 0;
            });
        });
    }

    function toggleSelection(organization) {
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
    }
}]);
