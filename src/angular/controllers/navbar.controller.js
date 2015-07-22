var controllers = angular.module('controllers');

controllers.controller('NavbarCtrl', ['$scope', 'Cookies', function ($scope, Cookies) {
  $scope.languages = ['AR','EN'];
  $scope.selectedLanguage = Cookies.getCookie('LANGUAGE') || 'AR';

  $scope.changeLanguage = function (langKey) {
    // we just set the cookie and reload since things aren't set up to properly reload new services list
    Cookies.setCookie('LANGUAGE', langKey);
    window.location.reload();
  };

  $(".filter-pill").click(function(event) {
    //TODO
    event.stopPropagation();
  });

  $scope.toggleFilters = toggleFilters;
}]);

// Global so that filters.controller can access this via its scope
// TODO: Should probably put this somewhere else
toggleFilters = function() {
  $('#filters').toggleClass('hidden');

  // var filterPlaceholder = $('#filterPlaceholder');
  // if(! $('#filters').hasClass('hidden')) {
  //   filterPlaceholder.hide();
  // }
  // else if ($('#filterSummary').find('button.filter-pill').length == 0) {
  //   filterPlaceholder.show();
  // }
  // else {
  //   filterPlaceholder.hide();
  // }
};
