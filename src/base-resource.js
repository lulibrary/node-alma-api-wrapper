const _merge = require('lodash.merge')

class BaseResource {
  constructor (data, config) {
    this.config = _merge({}, this.constructor.config, config)
    this.data = (typeof data === 'string') ? { [this.config.id]: data } : data
    this.id = this.data[this.config.id]
    this.subResources = {}
  }

  static get (...ids) {
    return this.config.api.get(this.config.path(...ids))
      .then((data) => {
        return new this(data)
      })
  }

  static for (id) {
    return new this(id)
  }

  static new (id) {
    return new this(id)
  }

  static setConfig (config, path) {
    _merge(this.config, config)
    return this
  }

  getSubResourceMap (name) {
    let subResourceMap = this.subResources[name]
    const child = this.constructor.children[name]
    const path = child.path(this.id)

    return subResourceMap
      ? Promise.resolve(subResourceMap)
      : this.config.api.get(path)
        .then((data) => {
          this.subResources[name] = new Map(data[child.key].map(subResource => [subResource[child.id], new child.Class(subResource)]))
          return this.subResources[name]
        })
  }

  getSubResource (name, id) {
    let subResourceMap = this.subResources[name]
    return (subResourceMap && subResourceMap.has(id))
      ? Promise.resolve(this.subResources[name].get(id))
      : this.getSubResourceFromApi(name, id)
  }

  getSubResourceFromApi (name, id) {
    const child = this.constructor.children[name]
    let subResourceMap = this.subResources[name]

    return child.Class.get(id)
      .then(childInstance => {
        if (subResourceMap) {
          subResourceMap.set(id, childInstance)
        } else {
          this.subResources[name] = new Map([[id, childInstance]])
        }
        return childInstance
      })
  }
}

BaseResource.apiData = {
  path: () => '/'
}
BaseResource.config = {}

module.exports = BaseResource
