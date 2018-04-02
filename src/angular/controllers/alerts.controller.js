var controllers = angular.module('controllers');

/*

  Handles the alert view logic

*/

controllers.controller('AlertsCtrl', ['AlertBag', '$rootScope', '$scope', function (AlertBag, $rootScope, $scope) {
    $scope.messages = AlertBag.getMessages();

    $rootScope.$on('$routeChangeSuccess', () => {
        AlertBag.clearMessages();
        $scope.messages = AlertBag.getMessages();
    });
}]);
