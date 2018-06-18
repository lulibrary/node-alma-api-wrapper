const Resource = require('./resource')

class Loan extends Resource {
  constructor (path, api, loanID) {
    super(path, api, 'loans', loanID)
  }
}

module.exports = Loan