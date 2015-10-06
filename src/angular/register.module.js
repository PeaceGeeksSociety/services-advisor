// Registering the modules in the angular applications along
// with their dependencies

/*** Routes ***/
angular.module('servicesAdvisorApp', ['ngRoute', 'controllers', 'services', 'directives', 'pascalprecht.translate']);

/*** Services ***/
angular.module('services', ['ngResource','underscore']);

/*** controllers ***/
angular.module('controllers', ['underscore']);

/*** directives ***/
angular.module('directives', []);


/*** registering  underscore.js helper ***/

// Just inject into where you need it like a service

// documentation: http://underscorejs.org/

angular.module('underscore', []);
