const Resource = require('./resource')

class Request extends Resource {
  constructor (path, api, requestID) {
    super(path, api, 'requests', requestID)
  }
}

module.exports = Request