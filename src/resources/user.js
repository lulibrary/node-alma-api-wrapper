const Resource = require('./resource')
const Loan = require('./loan')
const Request = require('./request')

class User extends Resource {
  constructor (path, api, userID) {
    super(path, api, 'users', userID)
  }

  Loans (loanID) {
    return new Loan(this.path, this.api, loanID)
  }

  Requests (requestID) {
    return new Request(this.path, this.api, requestID)
  }
}

module.exports = User