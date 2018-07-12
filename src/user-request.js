const BaseResource = require('./base-resource')

class UserRequest extends BaseResource {}

UserRequest.config = {
  path: (userID, requestID) => `/users/${userID}/requests/${requestID}`,
  id: 'request_id'
}

module.exports = UserRequest
