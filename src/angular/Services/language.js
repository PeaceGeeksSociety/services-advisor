var services = angular.module('services');

services.factory('Language', ['$location', '$window', 'SiteSpecificConfig', '_', 'Map', function ($location, $window, SiteSpecificConfig, _, Map) {
  var Language = {
    getAllLanguages: function() {
      return SiteSpecificConfig.languages;
    },
    getLanguageKey: function() {
      return $location.search().language || SiteSpecificConfig.defaultLanguage;
    },
    getLanguage: function() {
      var key = Language.getLanguageKey();
      return Language.getAllLanguages()[key];
    },
    getDirection: function() {
      return Language.getLanguage().languageDirection;
    },
    setLanguage: function(lang) {
      var map = Map.get();
      // Redirect the page home and add the query parameter.
      window.location.href = '#/?language=' + lang + "&bbox=" + encodeURI(JSON.stringify(map.getBounds()));
      $window.location.reload();
    }
  };

  return Language;
}]);
