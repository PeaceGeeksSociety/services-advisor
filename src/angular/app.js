
/* Note *****************************************************************************************

 the register.module.js file intiailly defines the module

 example: angular.module('controllers', []); to retreieve the reference to module simply call
          var controller = angular.module('controllers');

 docRef: https://docs.angularjs.org/error/$injector/nomod?p0=servicesAdvisorApp

************************************************************************************************* */

// SASS for the project.
require('../scss/main.scss');

// Polyfills
require('./requestIdleCallbackPolyfill');

// Register App Modules
require('./register.module.js');

// require the config file that will change between deployments
require('../site-specific-config.js');

// Directives
require('./Directives/alert.js');
require('./Directives/collapsible.js');
require('./Directives/field.js');
require('./Directives/languagedirectionattr.js');
require('./Directives/languagedirectionclass.js');
require('./Directives/logo.js');
require('./Directives/menuitem.js');
require('./Directives/search.js');
require('./Directives/searchcheckbox.js');
require('./Directives/servicecategorysummary.js');

// Routes
require('./Routes/routes.js');

// Services
require('./Services/alertbag.js');
require('./Services/longtask.js');
require('./Services/defaultsettings.js');
require('./Services/feedback.js');
require('./Services/language.js');
require('./Services/markers.js');
require('./Services/map.js');
require('./Services/regionlist.js');
require('./Services/search.js');
require('./Services/sectorlist.js');
require('./Services/serviceslist.js');
require('./Services/underscore.js');

// Controllers
require('./controllers/alerts.controller.js');
require('./controllers/feedback.controller.js');
require('./controllers/filter.controller.js');
require('./controllers/map.controller.js');
require('./controllers/navbar.controller.js');
require('./controllers/results.controller.js');
require('./controllers/search.controller.js');
require('./controllers/service.controller.js');
require('./controllers/servicepopup.controller.js');

// Translations
require('./translations/translations.config.js');
