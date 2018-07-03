const BaseResource = require('./base-resource')
const UserLoan = require('./user-loan')
const UserRequest = require('./user-request')

class User extends BaseResource {
  loans () {
    return this.getSubResourceMap('loans')
  }

  requests () {
    return this.getSubResourceMap('requests')
  }

  getLoan (loanID) {
    return this.getSubResource('loans', loanID)
  }

  getRequest (requestID) {
    return this.getSubResource('requests', requestID)
  }
}

User.config = {
  path: (userID) => `/users/${userID}`,
  id: 'primary_id'
}
User.children = {
  loans: {
    key: 'item_loan',
    id: 'loan_id',
    Class: UserLoan,
    path: (userID) => `/users/${userID}/loans`
  },
  requests: {
    key: 'user_request',
    id: 'request_id',
    Class: UserRequest,
    path: (userID) => `/users/${userID}/requests`
  }
}

module.exports = User
