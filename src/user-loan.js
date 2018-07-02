const Resource = require('./base-resource')

class UserLoan extends Resource {}

UserLoan.config = {
  path: (userID, loanID) => `/users/${userID}/loans/${loanID}`,
  id: 'loan_id'
}

module.exports = UserLoan
