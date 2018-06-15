
class Path {
  constructor () {
    this.self = ''
  }

  reset () {
    this.self = ''
  }

  append (str) {
    this.self += str
  }

  toString () {
    return this.self
  }

}

module.exports = Path