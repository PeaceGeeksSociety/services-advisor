var controllers = angular.module('controllers');

/*

  Handles the filter view logic

*/

controllers.controller('FilterCtrl', ['$scope', '$rootScope', '$location', 'Search', 'ServicesList', '_', '$timeout', function ($scope, $rootScope, $location, Search, ServicesList, _, $timeout) {

 // defines a function to callback function for filtering data
  var collectOrganizations = function(data){

    /*
      1. Original Organization/Partner name array

         Here we make use of methods in underscore to pluck the organization names

         Sample: ["IOCC", "UNHCR", "WVI", "JRS", ...,  "NHF"]
    */
    organizationsArray = _.chain(data)
                          .map(function (service) { return { name: service.organization.name, logoUrl: service.logoUrl }; })
                          .unique()
                          .value();

     /*

      2. Spliting the Array into two arrays (For Column Display)

     */                             
    var splitValue = organizationsArray.length/3;    
    
    // Using the split value, we divide the array evenly into two separate arrays 
    // Resulting array = [ ['UNHCR', 'stuff '], ['stuff', 'stuff'] ]
    $scope.organizationsArray = _.chain(organizationsArray)
                                  // Converts the array into an even Split
                                 .groupBy(function(element, index){
                                    return Math.floor(index/splitValue);
                                  })
                                 .toArray()
                                .value();
  }

  $rootScope.filterSelection = []

  // calls the ServiceList function get which takes a call back function
  // in this case we are collecting Organizations
  ServicesList.get(collectOrganizations);

  // selected organizations
  $scope.toggleReferral = function(value) {
    var parameters = $location.search();
    if ($scope.referral.selection == 'all') {
      //Don't display the 'all' filter
      if (_.has(parameters, 'referrals')){
        delete parameters.referrals
      }
    } else {
      parameters.referrals = $scope.referral.selection;
    }
    $location.search(parameters);
    Search.filterByUrlParameters();
  };

  $scope.referral = {
      selection: 'all'
  };

  // toggle selection for a given organization by name
  $scope.toggleSelection = function toggleSelection(organization) {

    var parameters = $location.search();
    if (_.has(parameters, 'organization')){
        var organizations = typeof(parameters.organization) == "string" ? parameters.organization.split(',') : parameters.organization;
        var idx = organizations.indexOf(organization);
        // is currently selected - splice that organization from selected array
        if (idx > -1) {
            organizations.splice(idx, 1);
        }
        // is newly selected - push organization into the selection array
        else {
            organizations.push(organization);
        }
        parameters.organization = organizations;
    } else {
        parameters.organization = [organization];
    }
    // still binding the pills to filterSeletion.
    $rootScope.filterSelection = parameters.organization;
    $location.search(parameters);
    Search.filterByUrlParameters();

    $timeout(function () {
        // hack to reset body padding height so if the size of the filter bar grows we can
        // still see the rest of the UI. Wrapped in timeout because need angular to refresh the UI
        // so we can read the height and couldn't figure out how to hook into that event
    $("body").css("padding-top", $("#searchNav").height() + "px");
    }, 2);
};

  $scope.toggleFilters = toggleFilters;


}]);

