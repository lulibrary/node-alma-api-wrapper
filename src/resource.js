const _merge = require('lodash.merge')

class Resource {
  constructor (data, config) {
    this.data = data
    this.config = _merge({}, this.constructor.config, config)
    this.resources = {}
  }

  static get (userID, api) {
    return (api || this.config.api).get(`/${this.resource.path}/${userID}`)
      .then((data) => {
        return new this.resource.Class(data, api ? { api } : null)
      })
  }

  static for (userID, api) {
    return new this.resource.Class({ primary_id: userID }, api ? { api } : null)
  }

  static new (userID, api) {
    return new this.resource.Class({ primary_id: userID }, api ? { api } : null)
  }

  static setConfig (config) {
    _merge(this.config, config)
    return this
  }
}

Resource.resource = {
  name: 'resource',
  path: '',
  Class: Resource
}
Resource.config = {}

module.exports = Resource
