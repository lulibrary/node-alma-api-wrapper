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

  static setConfig (config) {
    _merge(this.config, config)
    // Sets the config on any child Classes
    if (this.children) {
      Object.keys(this.children).forEach(key => {
        if (this.children[key].Class !== this) { // Avoid recursively setting config on the same class
          this.children[key].Class.setConfig(config)
        }
      })
    }
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
          this.subResources[name] = data[child.key].length !== 0
            ? createSubResourceMap(data[child.key], child.Class, child.id)
            : new Map()
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

    return child.Class.get(this.id, id)
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

const createSubResourceMap = (subResources, ResourceClass, idKey) => {
  return new Map(subResources.map(subResource => [subResource[idKey], new ResourceClass(subResource)]))
}

BaseResource.apiData = {
  path: () => '/'
}
BaseResource.config = {}

module.exports = BaseResource
