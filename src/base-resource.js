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
      Object.keys(this.children).forEach(childName => {
        const ChildClass = this.children[childName].Class
        if (ChildClass !== this) { // Avoid recursively setting config on the same class
          ChildClass.setConfig(config)
        }
      })
    }
    return this
  }

  // Return existing resourceMap or create new Map from API response
  _getSubResourceMap (name) {
    let subResourceMap = this.subResources[name]
    const child = this.constructor.children[name]
    const path = child.path(this.id)

    return subResourceMap
      ? Promise.resolve(subResourceMap)
      : this.config.api.get(path)
        .then((responseData) => {
          const responseList = responseData[child.almaResourceName]
          this.subResources[name] = (responseList && responseList.length !== 0)
            ? createSubResourceMap(responseList, child.Class, child.almaResourceID)
            : new Map()
          return this.subResources[name]
        })
  }

  // Return existing subResource or instantiate new subResource using API
  _getSubResource (name, id) {
    let subResourceMap = this.subResources[name]
    return (subResourceMap && subResourceMap.has(id))
      ? Promise.resolve(this.subResources[name].get(id))
      : this._getSubResourceFromApi(name, id)
  }

  // Instantiate new subResource using API
  _getSubResourceFromApi (name, id) {
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

// Create a Map of subResources instances
const createSubResourceMap = (subResources, ResourceClass, idKey) => {
  const mapValues = subResources.map(subResource => [subResource[idKey], new ResourceClass(subResource)])
  return new Map(mapValues)
}

BaseResource.config = {}

module.exports = BaseResource
