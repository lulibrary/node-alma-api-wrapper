const BaseResource = require('./base-resource')
const UserLoan = require('./user-loan')
const UserRequest = require('./user-request')
const UserFee = require('./user-fee')

class User extends BaseResource {
  loans () {
    return this._getSubResourceMap('loans')
  }

  requests () {
    return this._getSubResourceMap('requests')
  }

  fees () {
    return this._getSubResourceMap('fees')
  }

  getLoan (loanID) {
    return this._getSubResource('loans', loanID)
  }

  getRequest (requestID) {
    return this._getSubResource('requests', requestID)
  }

  getFee (feeID) {
    return this._getSubResource('fees', feeID)
  }

  getLoanFromApi (loanID) {
    return this._getSubResourceFromApi('loans', loanID)
  }

  getRequestFromApi (requestID) {
    return this._getSubResourceFromApi('requests', requestID)
  }

  getFeeFromApi (feeID) {
    return this._getSubResourceFromApi('fees', feeID)
  }
}

User.config = {
  path: (userID) => `/users/${userID}`,
  id: 'primary_id'
}
User.children = {
  loans: {
    almaResourceName: 'item_loan',
    almaResourceID: 'loan_id',
    Class: UserLoan,
    path: (userID) => `/users/${userID}/loans`
  },
  requests: {
    almaResourceName: 'user_request',
    almaResourceID: 'request_id',
    Class: UserRequest,
    path: (userID) => `/users/${userID}/requests`
  },
  fees: {
    almaResourceName: 'fee',
    almaResourceID: 'id',
    Class: UserFee,
    path: (userID) => `/users/${userID}/fees`
  }
}

module.exports = User
