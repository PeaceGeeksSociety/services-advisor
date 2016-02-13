var config = {};

config.languages = [
  {
    name : 'English',
    abbrev : 'EN',
    url : 'http://amani.ab.dev/service-locations?lang=en',
    outfile : '../js/services_EN.json'
  },
  {
    name : 'Arabic',
    abbrev: 'AR',
    url : 'http://amani.ab.dev/service-locations?lang=ar',
    outfile : '../js/services_AR.json'
  },
];


module.exports = config;