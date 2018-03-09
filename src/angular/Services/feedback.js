var services = angular.module('services');

services.factory('Feedback', ['$http', 'SiteSpecificConfig', function($http, SiteSpecificConfig) {
    return {
        send: (feedback) => {
            console.log(feedback);
            if (SiteSpecificConfig.feedbackEndpoint) {
                return $http.post(SiteSpecificConfig.feedbackEndpoint, feedback);
            } else {
                return Promise.reject(new Error('feedbackEndpoint configuration missing.'));
            }
        }
    }
}]);
