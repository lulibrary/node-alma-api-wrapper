const chai = require('chai')
chai.should()

const AlmaClient = require('../src/alma-client')

// Module under test
const API = require('../src')

describe('module tests', () => {
  it('should export the AlmaClient Class', () => {
    API.should.not.be.null
    API.should.deep.equal(AlmaClient)
  })
})
