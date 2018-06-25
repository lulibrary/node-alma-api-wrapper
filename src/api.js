const axios = require('axios')

class AlmaAxios {
  constructor (options) {
    this.config = options.config
    this.client = axios.create({
      baseURL: `https://api-${options.region}.hosted.exlibrisgroup.com/almaws/v1`,
      headers: {
        Authorization: `apikey ${options.key}`
      },
      params: {
        format: 'json'
      }
    })
  }

  get (url, config) {
    return this.client.get(url, config).then(res => res.data)
  }
}

module.exports = AlmaAxios
