const axios = require('axios')

class AlmaApi {
  constructor(config) {
    this.config = config
    this.client = axios.create({
      baseURL: `https://api-${config.region}.hosted.exlibrisgroup.com/almaws/v1`,
      headers: {
        Authorization: `apikey ${config.key}`
      },
      params: {
        format: 'json'
      }
    })
  }

  get (url, config) {
    return this.client.get(url, config)
  }
}

module.exports = AlmaApi