const chai = require('chai')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(sinonChai)
chai.use(chaiAsPromised)
chai.should()

const sinon = require('sinon')
const sandbox = sinon.createSandbox()
const uuid = require('uuid/v4')

const AlmaAxios = require('../src/api')

// Module under test
const Resource = require('../src/resource')

const testAxios = new AlmaAxios({
  region: 'eu',
  key: 'secretkey'
})

describe('Resource class tests', () => {
  afterEach(() => {
    sandbox.restore()
  })

  describe('static method tests', () => {
    describe('get method tests', () => {
      before(() => {
        Resource.resource.path = 'resource_test'
      })

      after(() => {
        Resource.resource.path = ''
      })
      it('should call the api with the correct path', () => {
        const getStub = sandbox.stub(testAxios, 'get')
        getStub.resolves(true)

        const testUserID = uuid()

        return Resource.get(testUserID, testAxios)
          .then(() => {
            getStub.should.have.been.calledWith(`/resource_test/${testUserID}`)
          })
      })

      it('should resolve with a new Resource instance', () => {
        const testUserID = uuid()
        const testUserData = {
          primary_id: testUserID,
          loan_ids: [uuid(), uuid()]
        }
        const getStub = sandbox.stub(testAxios, 'get')
        getStub.resolves(testUserData)

        return Resource.get(testUserID, testAxios)
          .then(res => {
            res.should.be.an.instanceOf(Resource)
            res.config.api.should.deep.equal(testAxios)
          })
      })

      it('should call the config API if no api argument is supplied', () => {
        const getStub = sandbox.stub(testAxios, 'get')
        getStub.resolves(true)

        const testUserID = uuid()
        Resource.config = {
          api: testAxios
        }

        return Resource.get(testUserID)
          .then(() => {
            getStub.should.have.been.calledWith(`/resource_test/${testUserID}`)
          })
      })
    })

    describe('for method tests', () => {
      it('should return a new Resource instance', () => {
        const testUserID = uuid()
        const result = Resource.for(testUserID)

        result.should.be.an.instanceof(Resource)
        result.data.should.deep.equal({ primary_id: testUserID })
      })
    })

    describe('new method tests', () => {
      it('should return a new Resource instance', () => {
        const testUserID = uuid()
        const result = Resource.new(testUserID)

        result.should.be.an.instanceof(Resource)
        result.data.should.deep.equal({ primary_id: testUserID })
      })
    })
  })

  describe('setConfig method tests', () => {
    it('should overwrite all provided properties in the config', () => {
      Resource.config = {
        param1: `old_value_${uuid()}`,
        param2: {
          test: `old_value_${uuid()}`,
          test2: `old_value_${uuid()}`
        },
        param3: `old_value_${uuid()}`
      }

      const newConfig = {
        param1: `new_value_${uuid()}`,
        param2: `new_value_${uuid()}`,
        param3: {
          test: `new_value_${uuid()}`
        },
        param4: `new_value_${uuid()}`
      }

      Resource.setConfig(newConfig)

      Resource.config.should.deep.equal(newConfig)
    })

    it('should not replace any properties not provided', () => {
      Resource.config = {}
      const param1 = `new_value_${uuid()}`
      const param2 = {
        test1: `new_value_${uuid()}`,
        test2: `old_value_${uuid()}`
      }
      const param3 = `old_value_${uuid()}`

      Resource.config = {
        param1: `old_value_${uuid()}`,
        param2: {
          test1: `old_value_${uuid()}`,
          test2: param2.test2
        },
        param3: param3
      }

      const newConfig = {
        param1: param1,
        param2: {
          test1: param2.test1
        }
      }

      const expected = {
        param1,
        param2,
        param3
      }

      Resource.setConfig(newConfig)

      Resource.config.should.deep.equal(expected)
    })

    it('should apply the new config to new Resource instances', () => {
      Resource.config = {}
      const newConfig = {
        param1: `new_value_${uuid()}`,
        param2: `new_value_${uuid()}`,
        param3: {
          test: `new_value_${uuid()}`
        },
        param4: `new_value_${uuid()}`
      }
      Resource.setConfig(newConfig)

      const testUser = new Resource({ primary_id: uuid() })
      testUser.config.should.deep.equal(newConfig)
    })

    it('should return the Resource class', () => {
      Resource.config = {}
      const newConfig = {
        param1: `new_value_${uuid()}`,
        param2: `new_value_${uuid()}`,
        param3: {
          test: `new_value_${uuid()}`
        },
        param4: `new_value_${uuid()}`
      }
      const result = Resource.setConfig(newConfig)

      result.should.deep.equal(Resource)
    })
  })
})
