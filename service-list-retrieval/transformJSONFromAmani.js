#!/usr/bin/env node

/*

Responsible for transforming the json data from the format ActivityInfo provides into
a more workable, readable version.

Run with `node transformJSON.js`

 */

var fs = require('fs');
var _ = require('underscore');
var config = require('./config');

/*
Helper method used to take a services referral information and
transform it into an object like:
{
	'required': true|false,
	'type':'some string description'
}

@param service:  the service we want to transform referral info for.
 */
var transformReferralMethod = function(service) {
	// Check if this feature has referral method "No Referral"
    referralData = service["details:Referral Method"];
     /*
     *  There are 7 possible values:
     *  "Email on a per case basis"
     *  "Referrals not accepted"       <-- marked as referral-not-required
     *  "IA Form"
     *  "Telephone on a per case basis"
     *  "RAIS"
     *  "Referral is not required"     <-- marked as referral-not-required
     *  And not defined at all         <-- marked as referral-not-required
     *
     *  The rest are marked as referral-required
     */

    var referralRequired = false;
    var referralType = null;

    if (referralData) {
    	if (referralData["Referrals not accepted"] === true || referralData["Referral is not required"]) {
    		referralRequired = false;
    	} else {
    		referralRequired = true;
    	}

    	_.each(referralData, function (val, type_description) {
    		referralType = type_description;
        });
    }

    var referral = new Object();
    referral.required = referralRequired;
    referral.type = referralData;
    // console.log(referral);
    return referral;
}

var transformServiceDetails = function(service) {
	var details = [];
	var hours = {};
  var tempArray = [];

	_.each(service, function(property_value, property_name) {
    if  (property_name.substr(0,8) == 'details:'){
      var obj = {};
      propname = property_name.replace('details:','');
      obj[propname] = property_value;
      details.push(obj);
    } else if (property_name.substr(0,6) == 'hours:'){
      hours[property_name.replace('hours:','')] = property_value;
    } else {

    }
    return;
	});

    var service_properties = {
        "details": details,
        "hours": hours
    }
	return service_properties;
}


/*
Transforms the data from activity info into a format that services
advisor can understand.
@param services: the list of services (from activity info)
@param language: the language we want the services to be translated in.
*/
var transformActivityInfoServices = function(services, language){
	transformedServices = [];

	for (var i = 0; i < services.length; i++){
		var serviceUntransformed = services[i].node;
		var serviceTransformed = new Object();
		serviceTransformed.id = serviceUntransformed.id;
		serviceTransformed.region = serviceUntransformed.region;

		//Init the organization
		var organization = new Object();
		organization.name = serviceUntransformed.organization;
		serviceTransformed.organization = organization;

		//Init the category
		var category = new Object();
		category.name = serviceUntransformed.category.toUpperCase();
		var subCategory = new Object();
		subCategory.name = serviceUntransformed.subCategory;
		category.subCategory = subCategory;
		serviceTransformed.category = category;

		serviceTransformed.startDate = serviceUntransformed.startDate;
		serviceTransformed.endDate = serviceUntransformed.endDate;

    var servicesProvided = [];
    servicesProvided.push(serviceUntransformed.servicesProvided);
		serviceTransformed.servicesProvided = servicesProvided;

		var locationFeature = new Object();
		locationFeature.type = "Feature";
		locationFeature.geometry = JSON.parse(serviceUntransformed['location:geometry']);
		serviceTransformed.location = locationFeature;

		var service_properties = transformServiceDetails(serviceUntransformed);
    serviceTransformed.details = service_properties.details;
    serviceTransformed.hours = service_properties.hours;

		serviceTransformed.referral = transformReferralMethod(serviceUntransformed);

		transformedServices.push(serviceTransformed);
	}
	return transformedServices;
}

// **** MAIN - Loop through each language, transform **** //

    for (var i in config.languages) {
      (function (language){
        console.log("Transforming " + language.name);
          var untransformedServices = require(language.downloaded_json);

          services = transformActivityInfoServices(untransformedServices, 'EN');

          var outputFilename = language.transformed_json;

          fs.writeFile(outputFilename, JSON.stringify(services), function (err) {
              if (err) {
                  console.log(err);
              }
          });
      })(config.languages[i]);
    }






