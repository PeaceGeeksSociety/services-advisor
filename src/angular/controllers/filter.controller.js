var controllers = angular.module('controllers');

/* 

  Handles the filter view logic 

*/

controllers.controller('FilterCtrl', ['$scope', '$rootScope', 'Search', 'ServicesList', '_', function ($scope, $rootScope, Search, ServicesList, _) {

 // defines a function to callback function for filtering data 
  var collectOrganizations = function(data){
    
    /* 
      1. Original Organization/Partner name array

         Here we make use of methods in underscore to pluck the organization names 
         
         Sample: ["IOCC", "UNHCR", "WVI", "JRS", ...,  "NHF"]
    */
     organizationsArray   = _.chain(data) 
                             .pluck("properties")
                             // partnerName is same as 'Organization'
                             .pluck("partnerName")
                             .unique()
                             .value();
     /*
      
      2. Spliting the Array into two arrays (For Column Display)
        
         Divide the organization names by half since we have two columns                         

     */                             
    var splitValue = organizationsArray.length/2;    
    
    // Using the split value, we divide the array evenly into two separate arrays 
    // Resulting array = [ ['UNHCR', 'stuff '], ['stuff', 'stuff'] ]
    $scope.organizationsArray = _.chain(organizationsArray)
                                  // Converts the array into an even Split
                                 .groupBy(function(element, index){
                                    return Math.floor(index/splitValue);
                                  })
                                 .toArray()
                                .value();
    /*
      
      3. Getting an Object that maps to Partner Logo URL 
      
      Creating a separate scope variable that maps Partner name to the respective Logo URL 
      We are doing this mainly not to temper with the original format of the Partner name in organizationsArray

      Example : "IFH/NFH " requires the " " at the end in order to map to the original object to make changes to
      side bar pill and the map 

      Data: Object 

    */
    $scope.partnerLogoUrl = _.object(
                                _.map(organizationsArray,function(partnerName){
                                  // Maps to an array to be converted to an Object
                                  // Sample: ["IOCC", ".src/images/partner/IOCC.jpg"]
                                  return [partnerName, './src/images/partner/' + partnerName.replace(/\//g,"-").replace(/\s/g, "").toLowerCase() + '.jpg']
                                })
                            )                             
    
                               
  }

  $rootScope.filterSelection = []
  $rootScope.referrals = true;
 
  // calls the ServiceList function get which takes a call back function 
  // in this case we are collecting Organizations
  ServicesList.get(collectOrganizations);

  // selected organizations
  $scope.toggleReferrals = function(element) {
    if (!$rootScope.referrals) {
      $rootScope.referrals = true;
    } else {
      $rootScope.referrals = false
    }
    Search.selectReferrals($rootScope.referrals);
  };

  // toggle selection for a given organization by name
  $scope.toggleSelection = function toggleSelection(organization) {
    
    // stores the index of the organization currently being click
    var idx = $rootScope.filterSelection.indexOf(organization);

    // is currently selected - splice that organization from selected array
    if (idx > -1) {
      $rootScope.filterSelection.splice(idx, 1);
    }
    // is newly selected - push organization into the selection array
    else {
      $rootScope.filterSelection.push(organization);
    }

    if ($rootScope.filterSelection.length == 0){
      Search.clearPartners();
      Search.selectReferrals($rootScope.referrals);
    } else{
      //reapply the referrals filters
      Search.clearPartners()
      Search.selectReferrals($rootScope.referrals);
      Search.selectPartners($rootScope.filterSelection);
    }
  };

  $scope.toggleFilters = toggleFilters;

}]);

