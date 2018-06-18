class Resource {
  constructor (path, api, resourceName, resourceID) {
    this.path = path
    this.api = api
    this.path.append(`/${resourceName}`)
    resourceID ? this.path.append(`/${resourceID}`) : null
  }

  get () {
    return this.api.get(this.path.toString()).then(res => res.data)
  }
}

module.exports = Resource