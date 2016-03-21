var config = {};

config.languages = [
  {
    name : 'English',
    abbrev : 'EN',
    url : 'http://amani.ab.dev/service-locations?lang=en',
    downloaded_json  : '../js/services_amani_EN.json',
    transformed_json : '../js/services_EN.json',
    sectors_url : 'http://amani.ab.dev/service-sectors?lang=en',
    sectors_file : '../js/sectors_EN.json'
  },
  {
    name : 'Arabic',
    abbrev: 'AR',
    url : 'http://amani.ab.dev/service-locations?lang=ar',
    downloaded_json : '../js/services_amani_AR.json',
    transformed_json : '../js/services_AR.json',
    sectors_url : 'http://amani.ab.dev/service-sectors?lang=ar',
    sectors_file : '../js/sectors_AR.json'
  },
];


module.exports = config;