var controllers = angular.module('controllers');

controllers.controller('NavbarCtrl', ['$scope', 'Cookies', function ($scope, Cookies) {
  $scope.languages = ['AR','EN'];
  $scope.selectedLanguage = Cookies.getCookie('LANGUAGE') || 'AR';

  $scope.changeLanguage = function (langKey) {
    // we just set the cookie and reload since things aren't set up to properly reload new services list
    Cookies.setCookie('LANGUAGE', langKey);

    // reload to / because we use the translated word in the URL so the same url won't work in a different language
    // example: /#/results?category=Financial%20assistance
    window.location = "/";
  };

  $scope.toggleFilters = toggleFilters;

  // when anywhere outside the filters overlay is clicked, close the filters
  $('body').on("click", function(e) {
    if (e.target.id !== "filtersButton" && e.target.id !== "filters" && $(e.target).parents("#filters").size() == 0) {
      $("#filters").removeClass('active')
    }
  })
  $('.overlay-tint').on('click', function(){
    $('.overlay-tint').toggleClass('active');
  })
}]);

toggleFilters = function () {
  $('#filters').toggleClass('active');  
  $('.overlay-tint').toggleClass('active');
};
