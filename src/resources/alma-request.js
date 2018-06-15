const Resource = require('./resource')

class Request extends Resource {
  constructor (path, api, loanID) {
    super(path, api)
    path.append('/requests')
    loanID ? path.append(`/${requestID}`) : null
  }
}

module.exports = Request