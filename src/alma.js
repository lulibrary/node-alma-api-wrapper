const Path = require('./path')
const AlmaApi = require('./api')
const User = require('./resources/user')

class Alma {
  constructor () {
    this.api = new AlmaApi({
      region: 'eu',
      key: process.env.ALMA_KEY
    })
    this.path = new Path()
  }

  Users (userID) {
    this.reset()
    return new User(this.path, this.api, userID)
  }

  reset () {
    this.path.reset()
  }
}

// Usage example

let alma = new Alma()

alma.Users('some-user').Requests().get().then(console.log).catch(console.log)

