angular.module('directives', [])
.directive('starRating', starRatingTemplate)


function starRatingTemplate() {
  return {
  	restrict: 'E',
  	controller: function($scope){
  		$scope.getNumber = function(number){

  			var ratings = [];

  			for (var i = 0; i < number; i++){
  				ratings.push(i);
  			}

  			return ratings;
  		};
  	},
  	scope: {
  		rating: "="
  	},
    template: '<div ng-repeat="numStars in getNumber(rating)" class="glyphicon glyphicon-star"></div>' +
    '<div ng-repeat="numStars in getNumber(5 - rating)" class="glyphicon glyphicon-star-empty"></div>'
  };
};
