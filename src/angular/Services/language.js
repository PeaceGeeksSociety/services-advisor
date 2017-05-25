var services = angular.module('services');

services.factory('Language', ['$location', '$window', 'SiteSpecificConfig', '_', 'Map', function ($location, $window, SiteSpecificConfig, _, Map) {
  return {
    getAllLanguages: function() {
      return SiteSpecificConfig.languages;
    },
    getLanguage: function() {
      return $location.search().language || SiteSpecificConfig.defaultLanguage;
    },
    setLanguage: function(lang) {
      var map = Map.get();
      // Redirect the page home and add the query parameter.
      window.location.href = '#/?language=' + lang + "&bbox=" + encodeURI(JSON.stringify(map.getBounds()));
      $window.location.reload();
    }
  };
}]);
