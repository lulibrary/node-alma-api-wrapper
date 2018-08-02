const BaseResource = require('./base-resource')

class UserFee extends BaseResource {}

UserFee.config = {
  path: (userID, feeID) => `/users/${userID}/fee/${feeID}`,
  id: 'id'
}

module.exports = UserFee
