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
        $scope.service.hotlinePhone = service.hotlinePhone;
        $scope.service.infoLink = service.infoLink;

        $scope.service.partnerLogoUrl = service.logoUrl;

        $scope.service.servicesProvided = service.servicesProvided;

        // Details
        $scope.service.nationality = service.nationality;
        $scope.service.intakeCriteria = service.intakeCriteria;
        $scope.service.accessibility = service.accessibility;
        $scope.service.coverage = service.coverage;
        $scope.service.availability = service.availability;
        $scope.service.referralMethod = service.referralMethod;
        $scope.service.referralNextSteps = service.referralNextSteps;
        $scope.service.feedbackMechanism = service.feedbackMechanism;
        $scope.service.feedbackDelay = service.feedbackDelay;
        $scope.service.complaintsMechanism = service.complaintsMechanism;

        $scope.officeHours = service.officeHours;

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
