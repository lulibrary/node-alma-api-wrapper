const chai = require('chai')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(sinonChai)
chai.use(chaiAsPromised)
chai.should()
const expect = chai.expect

const rewire = require('rewire')

const sinon = require('sinon')
const sandbox = sinon.createSandbox()
const uuid = require('uuid/v4')

const User = require('../src/user')
const UserLoan = require('../src/user-loan')
const UserRequest = require('../src/user-request')
const AlmaAxios = require('../src/api')

// Module under test
const AlmaClient = rewire('../src/alma-client')

let wires = []

describe('AlmaClient class tests', () => {
  const testKey = uuid()
  before(() => {
    process.env.ALMA_KEY = testKey
  })

  after(() => {
    delete process.env.ALMA_KEY
  })

  afterEach(() => {
    sandbox.restore()
    wires.forEach(wire => wire())
    wires = []
  })

  describe('constructor tests', () => {
    it('should create an instance of AlmaAxios on the Client', () => {
      const testClient = new AlmaClient({})

      testClient.api.should.be.an.instanceOf(AlmaAxios)
    })

    it('should set the default parameters on the API if no parameters are passed to the Client', () => {
      const apiStub = sandbox.stub()
      wires.push(AlmaClient.__set__('AlmaAxios', apiStub))

      const testClient = new AlmaClient()

      apiStub.should.have.been.calledWith({
        region: 'eu',
        key: testKey,
        config: {}
      })
    })

    it('should set the API parameters to be those passed in the constructor', () => {
      const apiStub = sandbox.stub()
      wires.push(AlmaClient.__set__('AlmaAxios', apiStub))

      const testParams = {
        region: uuid(),
        apikey: uuid(),
        config: {
          param1: uuid(),
          param2: uuid()
        }
      }

      const testClient = new AlmaClient(testParams)

      apiStub.should.have.been.calledWith({
        region: testParams.region,
        key: testParams.apikey,
        config: testParams.config
      })
    })

    it('should throw an error if no apikey is passed and the env variable is undefined', () => {
      delete process.env.ALMA_KEY

      expect(() => new AlmaClient()).to.throw('Missing API key')
    })

    it('should set the users object to be the User class', () => {
      process.env.ALMA_KEY = testKey

      const testClient = new AlmaClient()

      testClient.users.should.deep.equal(User)
    })

    it('should call setConfig on User', () => {
      process.env.ALMA_KEY = testKey

      const setConfigStub = sandbox.stub(User, 'setConfig')
      setConfigStub.returns(User)

      const testClient = new AlmaClient()

      setConfigStub.should.have.been.calledWith({
        api: testClient.api
      })
    })
  })
})
