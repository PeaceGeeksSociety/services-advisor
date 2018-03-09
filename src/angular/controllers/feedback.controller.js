var controllers = angular.module('controllers');

/*

  Handles the feedback view logic

*/

controllers.controller('FeedbackCtrl', ['$scope', '$location', 'Language', 'Feedback', function ($scope, $location, Language, Feedback) {
    $scope.disabled = true;
    $scope.loading = false;
    $scope.feedback = {};

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
            $scope.feedback.url = $location.path();
            $scope.feedback.language = Language.getLanguageKey().toLowerCase();
            $scope.loading = true;

            Feedback.send($scope.feedback).then((data, status, headers, config) => {
                $scope.feedback = {};
                $scope.loading = false;
            }, (data, status, headers, config) => {
                $scope.loading = false;
                console.log(data.message);
            });
        }
    }
}]);

