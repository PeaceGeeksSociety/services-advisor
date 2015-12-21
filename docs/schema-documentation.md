
# Example JSON

Example of json that we use for showing the services. Each service is an object within the array.
```
[
  {
    id: 603983240,
    region: "Amman Governorate",
    organization: {
      name: "UNHCR",
      imageUrl: "..."
    },
    category: {
      id: "EDUCATION",
      name: "Education",
      subCategory: {
        id: "EDUCATION_OPPORTUNITIES",
        name: "Education opportunities"
      }
    },
    startDate: "2014-01-01",
    endDate:"2014-12-31",
    servicesProvided: [
      "Remedial Tutoring",
      "School Uniforms"
    ],
    details: [
      "Intake Criteria": "Open to all",
      "Feedback Mechanism": "Event entered in RAIS"
    ],
    referral: {
      required: true,
      type: "Referral via email"
    },
    location: {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [125.6, 10.1]
      }
    }
  },
...
]
```

# Fields
Nested fields are specified using colons. For example
```
key: {
   nestedKey: "value"
}
```
Is documented as `key:nestedKey`

## `id` (required)
type: `integer`
Unique identifier for this service

## `region` (required)
type: `string`
Name of the region this service is in

## `organization:name` (required)
type: `string`
Name of the organization that runs this service

## `organization:imageUrl`
type: `string`
Url for an image we can use as the icon for this organization

## `category:id` (required)
type: `string`
Id for the category this service is in

## `category:name` (required)
type: `string`
Human-readable name of the category this service is in

## `category:subCategory:id` (required)
type: `string`
Id for the sub-category this service is in

## `category:subCategory:name` (required)
type: `string`
Human-readable name for the sub-category this service is in

## `startDate` (required)
type: `string`
format: `YYYY-MM-DD`
Date at which the service opens.

## `endDate` (required)
type: `string`
format: `YYYY-MM-DD`
Date at which the service closes.

## `servicesProvided`
type: `array[string]`
List of services provided at this location

## `details`
type: `object{string:string}`
The keys and values here will be used as descriptions of the service. They can be anything.

## `referral:required`
type: `boolean`
Whether referrals are required or not

## `referral:type`
type: `string`
Description of what type of referral is required (if any)

## `location` (required)
type: `object`
Follows the geojson specification: http://geojson.org/
