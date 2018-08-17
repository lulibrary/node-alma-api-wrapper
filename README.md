# node-alma-api-wrapper
A nodeJS wrapper for the Alma API

## Usage
`npm install git+ssh://git@github.com/lulibrary/node-alma-api-wrapper.git#master`
```javascript
const AlmaClient = require('alma-api-wrapper')

const almaApi = new AlmaClient({
    region: 'eu', // defaults to eu
    apikey: 'my_alma_api_key' // the api key can also be set on the environment variable ALMA_KEY
})

almaApi.users.for('my_user').loans()
    .then(loans => console.log(loans[0].data))
```

The wrapper covers retrieving certain data for Users in Alma. All user endpoints are covered in the User class, which exists on `almaApi.users`. 
`almaApi.users.get(userID)`
Calls `GET /users/<userID>`, returns a promise which resolves with a new User instance created from the API data.

`almaApi.users.for(userID)`
Returns a new instance of the User class.

`user.loans()`
Calls `GET /users/<userID>/loans`, returns a promise which resolves with an array of Loan instances.

`user.getLoan(loanID)`
Calls `GET /users/<userID>/loans/<loanID>`, returns a promise which a Loan instance created from the API data.

`user.requests()`
Calls `GET /users/<userID>/requests`, returns a promise which resolves with an array of Request instances.

`user.getRequest(requestID)`
Calls `GET /users/<userID>/requests/<requestID>`, returns a promise which a Request instance created from the API data.

`user.fees()`
Calls `GET /users/<userID>/fees`, returns a promise which resolves with an array of Fee instances.

`user.getFee(feeID)`
Calls `GET /users/<userID>/fees/<feeID>`, returns a promise which a Fee instance created from the API data.

All class instances created by API calls will have the raw API data stored on `data` property of the class

## Associated Services

There are four services that make up the Alma caching stack. These are:

- [alma-webhook-handler](https://github.com/lulibrary/alma-webhook-handler)       -   passes Alma webhook data to SNS topics :
- [LAG-sns-update-cache](https://github.com/lulibrary/LAG-sns-update-cache)       -   writes webhook data from SNS topics to  DynanoDB
- [LAG-bulk-update-cache](https://github.com/lulibrary/LAG-bulk-update-cache)     -   updates DynamoDB with data from Alma API for queued records
- [LAG-api-gateway](https://github.com/lulibrary/LAG-api-gateway)                 -   provides a REST API for cached Alma data with fallback to Alma API

There are also 3 custom packages on which these depend. These are:
- [LAG-Utils](https://github.com/lulibrary/LAG-Utils)                             -   utility library for AWS services
- [LAG-Alma-Utils](https://github.com/lulibrary/LAG-Alma-Utils)                   -   utility library for DynamoDB cache schemas
- [node-alma-api-wrapper](https://github.com/lulibrary/node-alma-api-wrapper)     -   utility library for querying Alma API


## Development
It is intended that this package can be extended to cover more, or all, of the current Alma API.
Contributions to this service or any of the associated services and packages are welcome.
