const BaseResource = require('./base-resource')

class UserFee extends BaseResource {}

UserFee.config = {
  path: (userID, feeID) => `/users/${userID}/fees/${feeID}`,
  id: 'id'
}

module.exports = UserFee
