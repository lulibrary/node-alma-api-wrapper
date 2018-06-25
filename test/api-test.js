const chai = require('chai')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(sinonChai)
chai.use(chaiAsPromised)
chai.should()

const sinon = require('sinon')
const sandbox = sinon.createSandbox()
const uuid = require('uuid/v4')

const axios = require('axios')

// Module under test
const AlmaAxios = require('../src/api')


describe('Alma Axios class tests', () => {
  afterEach(() => {
    sandbox.restore()
  })

  describe('constructor tests', () => {
    it('should create an instance of Axios', () => {

      const createStub = sandbox.stub(axios, 'create')
      createStub.returns('AXIOS')

      const testClient = new AlmaAxios({
        key: 'testkey',
        region: 'eu',
        config: {}
      })

      createStub.should.have.been.calledWith({
        baseURL: 'https://api-eu.hosted.exlibrisgroup.com/almaws/v1',
        headers: {
          Authorization: 'apikey testkey'
        },
        params: {
          format: 'json'
        }
      })
    })
  })

  describe('get method tests', () => {
    it('should call axios with the correct url', () => {
      const testClient = new AlmaAxios({
        key: 'testkey',
        region: 'eu',
        config: {}
      })

      const getStub = sandbox.stub(testClient.client, 'get')
      getStub.resolves(true)
      const path = `/users/${uuid()}`
      const testConfig = {
        test: uuid()
      }

      return testClient.get(path, testConfig).then(() => {
        getStub.should.have.been.calledWith(path,testConfig)
      })
      
    })

    it('should resolve with the data property of the axios result', () => {
      const testClient = new AlmaAxios({
        key: 'testkey',
        region: 'eu',
        config: {}
      })
      const testData = {
        data1: uuid(),
        data2: uuid()
      }

      const getStub = sandbox.stub(testClient.client, 'get')
      getStub.resolves({
        data: testData
      })

      return testClient.get('/users').then((data) => {
        data.should.deep.equal(testData)
      })
    })
  })
})

