var controllers = angular.module('controllers');

controllers.controller('ServiceCtrl', ['$scope', '$routeParams', '$location', 'ServicesList', 'Search', function ($scope, $routeParams, $location, ServicesList, Search) {

    // when a user clicks on "Show Details" from a map popup, we don't want all the icons on the map to suddenly be hidden
    // like they do when they come from a list view so we check the hideOthers param
    if ($location.search().hideOthers !== "false") {
        // only called when coming from a list view
        Search.selectId($routeParams.serviceId);
    }
    ServicesList.findById($routeParams.serviceId).then(function(service) {
        $scope.service = {};
        $scope.service.id = service.id;
        $scope.service.region = service.region;
        $scope.service.organization = {
            name: service.organization.name
        };
        $scope.service.category = {
            name: service.category.name,
            subCategory: {
                name: service.category.subCategory.name
            }
        };
        $scope.service.startDate = service.startDate;
        $scope.service.endDate = service.endDate;

        // TODO: reuse functionality in results controller to parse this info
        var partnerName = service.organization.name.toLowerCase().replace(' ', '');
        $scope.service.partnerLogoUrl = './src/images/partner/' + partnerName + '.jpg';

        $scope.service.servicesProvided = service.servicesProvided;

        var detailsList = []

        for (var i = 0; i < service.details.length; i++){
            var serviceDetails = service.details[i];

            var details = {}

            $.each(serviceDetails, function(val, key){
                details.first = val;
                details.second = key;
            });

            detailsList.push(details);
        }

        $scope.service.details = detailsList;
        $scope.hours = service.hours;


        $scope.goBackFromService = function() {
            var parameters = $location.search();
            if (_.has(parameters, 'category') || _.has(parameters, 'region')){
                $location.path('results').search(parameters);
            } else {
                $location.path('').search(parameters);
            }
        }
    });
}]);
