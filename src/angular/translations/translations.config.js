var servicesAdvisorApp = angular.module('servicesAdvisorApp');

servicesAdvisorApp.config(['$translateProvider', function ($translateProvider) {
  $translateProvider.useStaticFilesLoader({
    prefix: '../../../js/locale-',
    suffix: '.json'
  });
}]);
