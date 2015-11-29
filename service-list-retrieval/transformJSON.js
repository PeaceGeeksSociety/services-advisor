/*

Responsible for transforming the json data from the format ActivityInfo provides into
a more workable, readable version.

Run with `node transformJSON.js`

 */

var fs = require('fs');
var _ = require('underscore');

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
    referralData = service.properties["10. Referral Method"];    
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
    referral.type = referralType;
    // console.log(referral);
    return referral;
}


/*

Helper used to transform the 'details' section of a service. Details are anything
that is prefixed by a number in the ActivityInfo json format.

The result of this is a list of dictionaries like:

[
 {"Availability": "Every Day"},
 {"Availability Day": "Sun-Thurs"},
 {"Accessibility": "Walk-in & Outreach"}
]

@param service: the service for which details we want to transform.
 */
var transformServiceDetails = function(service) {
	var propList = [];
	var hours = []
	_.each(service.properties, function(key, property_name) {
        var tempArray = property_name.split(".");
        if (property_name != 'comments' && tempArray.length > 1) {
        	// console.log(tempArray[0]);
        	var integerPrefix = parseInt(tempArray[0], 10);
            if (integerPrefix) {
            	// console.log('is number');
                //TODO: Let's see if we can print it from index rather than creating new object for it again.
                var obj = {};
                // var level = integerPrefix;
                if (integerPrefix != 8) {
                    var detailsKey = tempArray[1].trim();
                    // console.log(detailsKey);
                    _.each(service.properties[property_name], function (val, details_description) {
                        if (details_description) {
                            obj[detailsKey] = details_description;
                        }
                    });
                    // console.log(integerPrefix);
                    // console.log(obj);
                    propList.push(obj);
                } else {
                    _.each(service.properties[property_name], function (val, value) {
                        if (value) {
                            hours.push(val);
                        }
                    });
                }
            }
        }
	});
	return propList;
	// console.log(propList);
	// console.log(hours);
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
		var serviceUntransformed = services[i];
		var serviceTransformed = new Object();
		serviceTransformed.id = serviceUntransformed.id;
		serviceTransformed.region = serviceUntransformed.properties.locationName;
		
		//Init the organization
		var organization = new Object();
		organization.name = serviceUntransformed.properties.partnerName;
		serviceTransformed.organization = organization;

		//Init the category
		var category = new Object();
		category.id = serviceUntransformed.properties.activityCategory;
		
		var subCategory = new Object();
		subCategory.name = serviceUntransformed.properties.activityName;
		category.subCategory = subCategory;
		serviceTransformed.category = category;
		
		serviceTransformed.startDate = serviceUntransformed.properties.startDate;
		serviceTransformed.endDate = serviceUntransformed.properties.endDate;
		
		var details = [];
		for (indicator in serviceUntransformed.properties.indicators) {
			details.push(indicator);
		}
		serviceTransformed.details = details;

		var locationFeature = new Object();
		locationFeature.type = "Feature";
		locationFeature.geometry = serviceUntransformed.geometry;
		serviceTransformed.location = locationFeature;

		serviceTransformed.servicesProvided = transformServiceDetails(serviceUntransformed);

		serviceTransformed.referral = transformReferralMethod(serviceUntransformed);

		transformedServices.push(serviceTransformed);
	}
	return transformedServices;
}


// Truncate Comments from compile.json file
var untransformedServices = require('./services.json');

services = transformActivityInfoServices(untransformedServices, 'EN');

for (var i = 0; i < services.length; i++) {
    delete services[i].comments;
}

var outputFilename = '../js/services_EN_new.json';

fs.writeFile(outputFilename, JSON.stringify(services), function (err) {
    if (err) {
        console.log(err);
    }
}); 


