const chai = require('chai')
chai.should()

// Module under test
const API = require('../src')

describe('module tests', () => {
  it('should export an object', () => {
    API.should.be.an('object')
  })
})