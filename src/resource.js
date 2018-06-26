const _merge = require('lodash.merge')

class Resource {
  constructor (data, config) {
    this.data = data
    this.config = _merge({}, this.constructor.config, config)
    this.resources = {}
  }

  static get (userID, api) {
    return api.get(`/users/${userID}`)
      .then((data) => {
        return new this.Resource(data, { api })
      })
  }

  static for (userID, api) {
    return new this.Resource({ primary_id: userID }, api ? { api } : null)
  }

  static new (userID, api) {
    return new this.Resource({ primary_id: userID }, api ? { api } : null)
  }

  static setConfig (config) {
    _merge(this.config, config)
    return this
  }
}

Resource.Resource = Resource
Resource.config = {}

module.exports = Resource
