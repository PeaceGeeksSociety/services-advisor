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
    referralData = service.referralMethod;
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

    var referral = {};
    referral.required = referralRequired;
    referral.type = referralData;
    // console.log(referral);
    return referral;
};

var transformServicesProvided = function (newService, servicesProvided) {
  var categories = [];
  var categoriesFlat = [];

  var addCategory = function (name, depth, siblings, parent) {
    exists = _.find(siblings, function (v) {
      return name == v.name;
    });

    var item = {};

    if (!exists) {
      var id = parent === null ? (name + depth) : (parent.id + name + depth);
      item.id = id.replace(/\s/g, "");
      item.name = name;
      item.depth = depth;
      item.children = [];

      siblings.push(item);
    } else {
      item = exists;
    }

    return item;
  };

  if (servicesProvided.length > 0) {
    _.each(servicesProvided.split('||'), function (branch) {
      var depth = 0;
      var siblings = categories;
      var parent = null;

      _.each(branch.split('›'), function (serviceItem) {
        var item = addCategory(serviceItem, depth, siblings, parent);

        var exists = _.find(categoriesFlat, function (v) {
          return item.id === v.id;
        });

        if (!exists) {
          categoriesFlat.push(item);
        }
        depth++;
        siblings = item.children;
        parent = item;
      });
    });
  }

  newService.servicesProvided = categories;
  newService.servicesProvidedFlat = categoriesFlat;
};

/*
Transforms the data from activity info into a format that services
advisor can understand.
@param services: the list of services (from activity info)
@param language: the language we want the services to be translated in.
*/
var transformActivityInfoServices = function(services){
	transformedServices = [];
  var nids = [];

	for (var i = 0; i < services.length; i++){
		var serviceUntransformed = services[i].node;
    if (nids.indexOf(serviceUntransformed.id) >= 0){
      continue;
    } else {
      nids.push(serviceUntransformed.id);
    }
		var serviceTransformed = {};
		serviceTransformed.id = serviceUntransformed.id;
		serviceTransformed.region = serviceUntransformed.region;

		//Init the organization
		var organization = {};
		organization.name = serviceUntransformed.organization;
		serviceTransformed.organization = organization;

		//Init the category
		var category = {};
		category.name = serviceUntransformed.category;
		var subCategory = {};
		subCategory.name = serviceUntransformed.subCategory;
		category.subCategory = subCategory;
		serviceTransformed.category = category;

		serviceTransformed.startDate = serviceUntransformed.startDate;
		serviceTransformed.endDate = serviceUntransformed.endDate;

    transformServicesProvided(serviceTransformed, serviceUntransformed.servicesProvided);

		var locationFeature = {};
		locationFeature.type = "Feature";

    if(serviceUntransformed['locationAlternate:geometry'].length > 0){
      locationFeature.geometry = JSON.parse(serviceUntransformed['locationAlternate:geometry']);
    } else {
      locationFeature.geometry = JSON.parse(serviceUntransformed['location:geometry']);
    }
		serviceTransformed.location = locationFeature;

    serviceTransformed.nationality         = serviceUntransformed.nationality;
    serviceTransformed.intakeCriteria      = serviceUntransformed.intakeCriteria;
    serviceTransformed.accessibility       = serviceUntransformed.accessibility;
    serviceTransformed.coverage            = serviceUntransformed.coverage;
    serviceTransformed.availability        = serviceUntransformed.availability;
    serviceTransformed.referralMethod      = serviceUntransformed.referralMethod;
    serviceTransformed.referralNextSteps   = serviceUntransformed.referralNextSteps;
    serviceTransformed.feedbackMechanism   = serviceUntransformed.feedbackMechanism;
    serviceTransformed.feedbackDelay       = serviceUntransformed.feedbackDelay;
    serviceTransformed.complaintsMechanism = serviceUntransformed.complaintsMechanism;
    serviceTransformed.hotlinePhone        = serviceUntransformed.hotlinePhone;
    serviceTransformed.infoLink            = serviceUntransformed.infoLink;

		serviceTransformed.referral = transformReferralMethod(serviceUntransformed);

    serviceTransformed.logoUrl = serviceUntransformed.organizationLogo.src;

    serviceTransformed.officeHours = serviceUntransformed.officeHours;

    var officeHours = serviceUntransformed.officeHours.split('|').filter(function (value) {
        return value.length > 0;
    });

    serviceTransformed.officeHours = [];

    for (var j = 0; j < officeHours.length; j++) {
        var dayParts = officeHours[j].split(': ');
        serviceTransformed.officeHours.push({'name': dayParts[0], 'time': dayParts[1]});
    }

		transformedServices.push(serviceTransformed);
	}
	return transformedServices;
};

// **** MAIN - Loop through each language, transform **** //

var initialize = function (language){
  console.log("Transforming " + language.name);
    var untransformedServices = require(language.downloaded_json);

    services = transformActivityInfoServices(untransformedServices);

    var outputFilename = language.transformed_json;

    fs.writeFile(outputFilename, JSON.stringify(services), function (err) {
        if (err) {
            console.log(err);
        }
    });
};

for (var i in config.languages) {
  initialize(config.languages[i]);
}






