const AlmaAxios = require('./api')
const User = require('./user')

class AlmaClient {
  constructor (options = {}) {
    this.api = new AlmaAxios({
      region: options.region || 'eu',
      key: options.apikey || process.env.ALMA_KEY || throwError(),
      config: options.config || {}
    })

    this.users = User.setConfig({ api: this.api })
  }
}

const throwError = () => {
  throw new Error('Missing API key')
}

module.exports = AlmaClient
