const Resource = require('./resource')

class Loan extends Resource {
  constructor (path, api, loanID) {
    super(path, api)
    path.append('/loans')
    loanID ? path.append(`/${loanID}`) : null
  }
}

module.exports = Loan