const BaseResource = require('./base-resource')

class UserLoan extends BaseResource {}

UserLoan.config = {
  path: (userID, loanID) => `/users/${userID}/loans/${loanID}`,
  id: 'loan_id'
}

module.exports = UserLoan
