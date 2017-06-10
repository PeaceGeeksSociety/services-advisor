var services = angular.module('services');

services.factory('SectorList', ['$http', 'Language', 'SiteSpecificConfig', function ($http, Language, SiteSpecificConfig) {
  var sectorsUrl = 'js/sectors_' + Language.getLanguageKey() + '.json';

  var sectors = $http.get(sectorsUrl).then(function (data) {
    var sectors = {};

    angular.forEach(data.data, function (item) {
      var sector = item.sector;

      sector.icon = L.AwesomeMarkers.icon({
          icon: sector.glyph,
          prefix: 'icon', // necessary because Humanitarian Fonts prefixes its icon names with "icon"
          iconColor: sector.markerColor,
          markerColor: "white",
          extraClasses: sector.name
      });

      sectors[sector.name] = sector;
    });

    return sectors;
  });

  return {
    get: function (successCb) {
      return sectors.then(successCb);
    }
  };
}]);
