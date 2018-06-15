class Resource {
  constructor (path, api) {
    this.path = path
    this.api = api
  }

  get () {
    return this.api.get(this.path.toString()).then(res => res.data)
  }
}

module.exports = Resource