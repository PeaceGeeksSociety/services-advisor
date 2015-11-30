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

  $(".filter-pill").click(function(event) {
    //TODO
    event.stopPropagation();
  });

  $scope.toggleFilters = toggleFilters;

}]);

toggleFilters = (function(){

    // Local variables defined 
    var $filter = $('#filters');
    var $body = $('body');     
    var $mapContainer  = $('#mapContainer');
    var $serviceList  = $('#serviceList');
    // check for 'active' class from the #filter DOM element
    var activeClass = $('#filters').attr('class').split(/ /)[1];  
    
    var _reloadVariables = function(){
        $filter = $('#filters');                
        activeClass = $('#filters').attr('class').split(/ /)[1];       
    }

    var _bindCloseListners = function(){
        $mapContainer.on('click',function(){
            $filter.removeClass('active');
        })
        $serviceList.on('click',function(){
            $filter.removeClass('active');
        })
    }

    _bindCloseListners();

    var _toggleFilter = function(){ 
        $body.on('click',function(event){    
            var nonActiveFilterBtn =  activeClass !== 'active' && event.target.id == 'filtersButton';
            var activeFilterBtn =  activeClass == 'active' && event.target.id == 'filtersButton';
            var activeApplyFilterBtn = activeClass == 'active' && event.target.id == 'applyFilter';            

            if (nonActiveFilterBtn){ $filter.addClass('active'); }
            else if(activeFilterBtn || activeApplyFilterBtn){ $filter.removeClass('active'); }                   
        })
    }

    var _exec = function(){    
        _reloadVariables();      
        // wait for DOM variable reload
        setTimeout(_toggleFilter(), 250);
    }

    return {
        exec : _exec
    }

})()

// Global so that filters.controller can access this via its scope
// TODO: Should probably put this somewhere else
// toggleFilters = function() {
//     var $filter = $('#filters');

//     $('body').on('click',function(e){
//         var targetElementId = e.target.id;
//         var activeClass = $filter.attr('class').split(/ /)[1];
                        
//         if (targetElementId == 'filtersButton' && activeClass !== 'active'){
//             $filter.addClass('active');            
//             console.log('active again.....');
//         }else {             
//             $('#filters').removeClass('active').removeClass('active');             
//             console.log(activeClass);
//         }

//     })
// };
