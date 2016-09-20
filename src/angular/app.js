
/* Note *****************************************************************************************

 the register.module.js file intiailly defines the module

 example: angular.module('controllers', []); to retreieve the reference to module simply call
          var controller = angular.module('controllers');

 docRef: https://docs.angularjs.org/error/$injector/nomod?p0=servicesAdvisorApp

************************************************************************************************* */

// Register App Modules
require('./register.module.js');

// require the config file that will change between deployments
require('../site-specific-config.js');

// Routes
require('./Routes/routes.js');

// Services
require('./Services/language.js');
require('./Services/popupbuilder.js');
require('./Services/search.js');
require('./Services/serviceslist.js');
require('./Services/underscore.js');

// Controllers
require('./controllers/search.controller.js');
require('./controllers/results.controller.js');
require('./controllers/navbar.controller.js');
require('./controllers/map.controller.js');
require('./controllers/service.controller.js');
require('./controllers/filter.controller.js');

// Translations
require('./translations/translations.config.js');
