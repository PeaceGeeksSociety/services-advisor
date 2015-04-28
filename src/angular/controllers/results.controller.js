var controllers = angular.module('controllers');

/**
 * For the results view
 */
controllers.controller('ResultsCtrl', ['$scope', '$location', 'Search', function ($scope, $location, Search) {
    
    // Filtered object based on the categories/regions
    var getFilteredResults = function ($location) {
        var filters = $location.search();

        // Start by clearing all existing searches
        Search.clearSelects();

        if (filters.region !== undefined) {
            Search.selectRegion(filters.region)
        }

        if (filters.category !== undefined) {
            Search.selectCategory(filters.category)
        }

        return Search.currResults();
    };

    $scope.results = getFilteredResults($location);

    // the methods below serves to get the key value in the object between each ng-repeat loop. 
    // The object is passed in from the view, manipulated then returned back.  

    // gets the opening time of the service 
    $scope.getOpeningTime = function(result){
        //define a variable to store the 'opening time'
        var openingTime = null;

        var timeObject = result.properties["8. Office Open at"];
        // Run this if the office opening time exists 
        if(timeObject){
            // Grabs the key value from the nested object which results in time in string
            openingTime = Object.keys(timeObject)[0];
        } 

        return openingTime;
    }

    // gets the closing time of the service 
    $scope.getClosingTime = function(result){
        //define a variable to store the 'closing time'
        var closingTime = null;
        var timeObject = result.properties["9. Office close at"];
        // Run this if the office closing time exists 
        if(timeObject){
            // Grabs the key value from the nested object which results in time in string
            closingTime = Object.keys(timeObject)[0];
        } 

        return closingTime;
    }

    // gets the activity details of the service 
    $scope.getActivityDetails = function(result){
        // Define a default variable value for activity details
        var activityDetails = ["Unknown"];
        var activities = result.properties["indicators"];
        // filters out the activites with zero count first
        for(key in activities){
            if(activities[key] === 0){
               delete activities[key];
            }
        }
        // if the activity exists we'll assign it to the store variable
        if(Object.keys(activities).length > 0){
             activityDetails = Object.keys(activities);
        } 

        return activityDetails;
    }
}]);
