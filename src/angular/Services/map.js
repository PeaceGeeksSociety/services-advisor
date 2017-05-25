var services = angular.module('services');

services.factory('Map', [function () {
    var map = {};
    return {
      get: function () {
        return map;
      },
      set: function(m) {
        map = m;
      }
    };
}]);
