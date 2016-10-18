var services = angular.module('services');

services.factory('Language', ['$location', '$window', 'SiteSpecificConfig', '_', function ($location, $window, SiteSpecificConfig, _) {
  return {
    getAllLanguages: function() {
      return _.keys(SiteSpecificConfig.languages);
    },
    getLanguage: function() {
      return $location.search().language || SiteSpecificConfig.defaultLanguage;
    },
    setLanguage: function(lang) {
      // Redirect the page home and add the query parameter.
      window.location.href = '#/?language=' + lang;
      $window.location.reload();
    }
  };
}]);
