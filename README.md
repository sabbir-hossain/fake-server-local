# fake-server-local

## What is fake-server-local?
`fake server local` is a **local REST api server**
which return random lorem-ipsum data based on user schema. It might be helpful for 
**Front-end/App developers**, who don't have sufficient data (might be REST 
api is not ready or not enough data in database) to test their projects. All you need, 
just create an api endpoint and output schema. You will get your sufficient data to test your project.

## Technologies used
`Node.js, Koa.js, neDB, JavaScript, HTML, CSS`

## Setup
- Clone this project (must have `node.js` installed in your machine )
- open project directory using terminal/Command Prompt
- run `npm install`
- run `npm start`
- now go to `http://localhost:9920/dashboard`
- create a project
- your fake api endpoint will be `http://localhost:9920/${your-project-title}`

## Creating Fake Api
> Select `Route type` (`GET|POST|PUT|PATCH|DELETE`) and type your route name. Now your route will be  `http://localhost:9920/${your-project-title}/${your-route-name}`

> Now add output schema. Schema will be json object, which will be as like as given below

`return-Type` can be 

```
id | uuid | boolean | text | title | textarea | integer | 
float | phone | zipcode | date | time | date-time | url | 
email | image | pdf | csv | doc |  ipaddress | token | second | alphanumeric
```

```JSON
{
  "original-response-key-01": "return-Type",
  "original-response-key-02": ["return-Type"],
  "original-response-key-03": "any fixed value",
  "original-response-key-04": "value-from-fixed-option-01,value-from-fixed-option-02,
                                value-from-fixed-option-03,value-from-fixed-option-04",
  "original-response-key-05": {
    "original-child-response-key-01": "return-Type",
    "original-child-response-key-02": ["return-Type"],
    "original-child-response-key-03": "any fixed value",
    "original-child-response-key-04": "value-from-fixed-option-01,value-from-fixed-option-02,
                                        value-from-fixed-option-03,value-from-fixed-option-04",
    "original-child-response-key-05": {
      "can-be-more-nested-key-01": "return-Type"
    }
  },
  "original-response-key-06": {
    "__type": "return-Type"
  },
  "original-response-key-07": {
    "__type": "array",
    "__range": "can-be-number|can-be-number-range",
    "__property": "return-Type"
  },
  "original-response-key-08": {
    "__type": "array",
    "__range": "can-be-number|can-be-number-range",
    "__property": {
      "original-array-property-01": "return-Type"
    }
  },
  "original-token-property-09": {
    "__type": "token",
    "__property": {
       "token-key-01": "return-Type",
       "token-key-02": "return-Type"
    }
  }
}
```

### Sample 

![alt text](https://raw.githubusercontent.com/shsaucorp/fake-server-local/master/public/assets/images/help-page/token-values.png) ![alt text](https://raw.githubusercontent.com/shsaucorp/fake-server-local/master/public/assets/images/help-page/array-values.png) 

![alt text](https://raw.githubusercontent.com/shsaucorp/fake-server-local/master/public/assets/images/help-page/array-values-2.png) 

