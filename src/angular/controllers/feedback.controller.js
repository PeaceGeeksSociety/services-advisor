var controllers = angular.module('controllers');

/*

  Handles the feedback view logic

*/

controllers.controller('FeedbackCtrl', ['$scope', '$routeParams', '$element', '$location', 'Language', 'Feedback', 'AlertBag', function ($scope, $routeParams, $element, $location, Language, Feedback, AlertBag) {
    $scope.disabled = true;
    $scope.loading = false;
    $scope.feedback = {};
    $scope.messages = [];

    $scope.onChange = () => {
        $scope.disabled = !($scope.feedbackValid() && $scope.loading !== true);
    }

    $scope.feedbackValid = () => {
        let hasTitle = $scope.feedback.title && $scope.feedback.title.length > 0;
        let hasType = $scope.feedback.type && $scope.feedback.type.length > 0;
        let hasSummary = $scope.feedback.summary && $scope.feedback.summary.length > 0;

        return (hasTitle && hasType && hasSummary);
    }

    $scope.submit = () => {
        if ($scope.feedbackValid()) {
            $scope.feedback.url = $location.url();
            $scope.feedback.language = Language.getLanguageKey().toLowerCase();
            // Add association to service.
            if ($routeParams.serviceId) {
                $scope.feedback.serviceId = $routeParams.serviceId;
            }

            $scope.loading = true;

            Feedback.send($scope.feedback).then((data, status, headers, config) => {
                $scope.feedback = {};
                $scope.loading = false;
                $scope.messages.push({
                    type: 'success',
                    body: 'Feedback successfully submitted'
                });
            }, (data, status, headers, config) => {
                $scope.loading = false;
                $scope.messages.push({
                    type: 'danger',
                    body: data.message
                });
            });
        }
    }

    // empty messages when modal is closed.
    angular.element($element).on('hidden.bs.modal', e => {
        // This happens outside of the digest cycle so we need to let angular
        // know about it.
        $scope.$apply(() => {
            $scope.messages = [];
        });
    })
}]);

