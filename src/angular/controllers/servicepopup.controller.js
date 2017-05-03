var controllers = angular.module('controllers');

controllers.controller('ServicePopupCtrl', ['$scope', function($scope) {
    $scope.service = $scope.feature;
}]);
