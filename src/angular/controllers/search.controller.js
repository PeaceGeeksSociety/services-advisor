var controllers = angular.module('controllers');

/**
 * For the category/region search view
 */
controllers.controller(
    'SearchCtrl',
    ['$scope', '$q', '$http', '$location', '$rootScope', 'SiteSpecificConfig', 'ServicesList', 'SectorList', 'RegionList', 'Search', '_', '$translate', 'Language',
    ($scope, $q, $http, $location, $rootScope, SiteSpecificConfig, ServicesList, SectorList, RegionList, Search, _, $translate, Language) => {

    const awaitData = $q.all([RegionList.get(), SectorList.get(), ServicesList.get()])
        .then(setScopeData)
        .catch(console.error.bind(console));

    $scope.feedbackMail = SiteSpecificConfig.feedbackMail;
    $scope.$on('$locationChangeSuccess', onLocationChangeSuccess);
    $scope.$on('FILTER_CHANGED', setCounts);
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
        setCounts();
        return [regions, sectors, services];
    }

    function setCounts() {
        // TODO: We awaitData here to ensure that $scope.{categories|regions} has been set.
        //       Execution sequence could be cleaned up a bit so that this isn't necessary.
        awaitData.then(
            () => {
                var categoryCounts = Search.getCategoryGroup.value();
                var regionCounts = Search.getRegionGroup.value();
                // TODO: There's no guarantee that $scope.categories or $scope.regions have been set here.
                $scope.categories.walk((node) => {
                    node.model.count = categoryCounts[node.model.id] || 0;
                });
                $scope.regions.walk((node) => {
                    node.model.count = regionCounts[node.model.id] || 0;
                });
            },
            // Log errors that occur in above promise handler.
            console.error.bind(console)
        )
    }

    function onLocationChangeSuccess() {
        // Only filter results if we stay on front route.
        if ($location.path() === '/') {
            Search.filterByUrlParameters();
        }
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
