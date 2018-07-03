const chai = require('chai')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(sinonChai)
chai.use(chaiAsPromised)
chai.should()

const sinon = require('sinon')
const sandbox = sinon.createSandbox()
const uuid = require('uuid/v4')
const _merge = require('lodash.merge')

const AlmaAxios = require('../src/api')

// Module under test
const BaseResource = require('../src/base-resource')

const testAxios = new AlmaAxios({
  region: 'eu',
  key: 'secretkey'
})

const baseConfig = {
  id: 'resource_id'
}

describe('BaseResource class tests', () => {
  afterEach(() => {
    sandbox.restore()
  })

  beforeEach(() => {
    _merge(BaseResource.config, baseConfig)
  })

  describe('constructor tests', () => {
    it('should set the data object as the first parameter if it is an object', () => {
      const testData = {
        thing1: uuid(),
        thing2: uuid(),
        resource_id: uuid()
      }

      const testResource = new BaseResource(testData)
      testResource.data.should.deep.equal(testData)
    })

    it('should create the data object with the ID field set with key from config.id', () => {
      const testID = uuid()
      BaseResource.config.id = 'resource_id'

      const expected = {
        resource_id: testID
      }

      const testResource = new BaseResource(testID)
      testResource.data.should.deep.equal(expected)
    })

    it('should set the resource ID as the ID field in the data objec', () => {
      const testID = uuid()
      BaseResource.config.id = 'resource_id'

      const testResource = new BaseResource(testID)
      testResource.id.should.deep.equal(testID)
    })
  })

  describe('static method tests', () => {
    describe('get method tests', () => {
      before(() => {
        BaseResource.config.path = (resID) => `/resource_test/${resID}`
      })

      after(() => {
        BaseResource.config.path = () => '/'
      })

      it('should call the api with the correct path', () => {
        BaseResource.config.api = testAxios
        const getStub = sandbox.stub(testAxios, 'get')
        getStub.resolves(true)

        const testUserID = uuid()

        return BaseResource.get(testUserID)
          .then(() => {
            getStub.should.have.been.calledWith(`/resource_test/${testUserID}`)
          })
      })

      it('should resolve with a new BaseResource instance', () => {
        const testUserID = uuid()
        const testUserData = {
          resource_id: testUserID,
          loan_ids: [uuid(), uuid()]
        }
        BaseResource.config.api = testAxios
        const getStub = sandbox.stub(testAxios, 'get')
        getStub.resolves(testUserData)

        return BaseResource.get(testUserID)
          .then(res => {
            res.should.be.an.instanceOf(BaseResource)
            res.config.api.should.deep.equal(testAxios)
          })
      })

      it('should call the path method with all passed arguments', () => {
        const pathStub = sandbox.stub(BaseResource.config, 'path')
        pathStub.returns('')
        const getStub = sandbox.stub(BaseResource.config.api, 'get')
        getStub.resolves(true)

        const testID1 = uuid()
        const testID2 = uuid()
        const testID3 = uuid()

        return BaseResource.get(testID1, testID2, testID3)
          .then(() => {
            pathStub.should.have.been.calledWithExactly(testID1, testID2, testID3)
          })
      })
    })

    describe('for method tests', () => {
      it('should return a new BaseResource instance', () => {
        const testUserID = uuid()
        const result = BaseResource.for(testUserID)

        result.should.be.an.instanceof(BaseResource)
        result.data.should.deep.equal({ resource_id: testUserID })
      })
    })

    describe('new method tests', () => {
      it('should return a new BaseResource instance', () => {
        const testUserID = uuid()
        const result = BaseResource.new(testUserID)

        result.should.be.an.instanceof(BaseResource)
        result.data.should.deep.equal({ resource_id: testUserID })
      })
    })
  })

  describe('setConfig method tests', () => {
    it('should overwrite all provided properties in the config', () => {
      BaseResource.config = {
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

      BaseResource.setConfig(newConfig)

      BaseResource.config.should.deep.equal(newConfig)
    })

    it('should not replace any properties not provided', () => {
      BaseResource.config = {}
      const param1 = `new_value_${uuid()}`
      const param2 = {
        test1: `new_value_${uuid()}`,
        test2: `old_value_${uuid()}`
      }
      const param3 = `old_value_${uuid()}`

      BaseResource.config = {
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

      BaseResource.setConfig(newConfig)

      BaseResource.config.should.deep.equal(expected)
    })

    it('should apply the new config to new BaseResource instances', () => {
      BaseResource.config = {}
      const newConfig = {
        param1: `new_value_${uuid()}`,
        param2: `new_value_${uuid()}`,
        param3: {
          test: `new_value_${uuid()}`
        },
        param4: `new_value_${uuid()}`
      }
      BaseResource.setConfig(newConfig)

      const testUser = new BaseResource({ resource_id: uuid() })
      testUser.config.should.deep.equal(newConfig)
    })

    it('should return the BaseResource class', () => {
      BaseResource.config = {}
      const newConfig = {
        param1: `new_value_${uuid()}`,
        param2: `new_value_${uuid()}`,
        param3: {
          test: `new_value_${uuid()}`
        },
        param4: `new_value_${uuid()}`
      }
      const result = BaseResource.setConfig(newConfig)

      result.should.deep.equal(BaseResource)
    })
  })

  describe('instance method tests', () => {
    describe('getSubResourceMap method tests', () => {
      before(() => {
        BaseResource.children = {
          testChild: {
            path: (resID) => `/testRes/${resID}/testChild`,
            key: 'test_res',
            id: 'resource_id',
            Class: BaseResource
          }
        }
      })

      it('should resolve with the subResource map if it exists', () => {
        const testResourceID = uuid()
        const testResource = new BaseResource(testResourceID)
        testResource.subResources.testChild = new Map([[uuid(), uuid()]])

        testResource.getSubResourceMap('testChild')
          .then((res) => {
            res.should.be.an.instanceOf(Map)
            res.should.deep.equal(testResource.subResources.testChild)
          })
      })

      it('should call the api if the subResource map does not exist', () => {
        const testResourceID = uuid()
        const testResource = new BaseResource(testResourceID, { api: testAxios })

        testResource.subResources = {}

        const getStub = sandbox.stub(testResource.config.api, 'get')
        getStub.returns({ then: () => null })

        testResource.getSubResourceMap('testChild')
        getStub.should.have.been.calledWith(`/testRes/${testResourceID}/testChild`)
      })

      it('should return the API response as a Map object', () => {
        const testResourceID = uuid()
        const testResource = new BaseResource(testResourceID, { api: testAxios })
        testResource.subResources = {}

        const testIDs = [uuid(), uuid(), uuid()]
        const apiResponse = { test_res: [
          {
            resource_id: testIDs[0],
            thing1: uuid(),
            thing2: uuid()
          }, {
            resource_id: testIDs[1],
            thing1: uuid(),
            thing2: uuid()
          }, {
            resource_id: testIDs[2],
            thing1: uuid(),
            thing2: uuid()
          }
        ]}
        const getStub = sandbox.stub(testResource.config.api, 'get')
        getStub.resolves(apiResponse)

        return testResource.getSubResourceMap('testChild')
          .then((res) => {
            res.should.be.an.instanceOf(Map)
            res.get(testIDs[0]).should.deep.equal(new BaseResource(apiResponse.test_res[0]))
            res.get(testIDs[1]).should.deep.equal(new BaseResource(apiResponse.test_res[1]))
            res.get(testIDs[2]).should.deep.equal(new BaseResource(apiResponse.test_res[2]))
          })
      })

      it('should add the subResource map to the subResources object', () => {
        const testResourceID = uuid()
        const testResource = new BaseResource(testResourceID, { api: testAxios })
        testResource.subResources = {}

        const testIDs = [uuid(), uuid(), uuid()]
        const apiResponse = { test_res: [
          {
            resource_id: testIDs[0],
            thing1: uuid(),
            thing2: uuid()
          }, {
            resource_id: testIDs[1],
            thing1: uuid(),
            thing2: uuid()
          }, {
            resource_id: testIDs[2],
            thing1: uuid(),
            thing2: uuid()
          }
        ]}
        const getStub = sandbox.stub(testResource.config.api, 'get')
        getStub.resolves(apiResponse)

        return testResource.getSubResourceMap('testChild')
          .then(() => {
            testResource.subResources.testChild.should.be.an.instanceOf(Map)
            testResource.subResources.testChild.get(testIDs[0]).should.deep.equal(new BaseResource(apiResponse.test_res[0]))
            testResource.subResources.testChild.get(testIDs[1]).should.deep.equal(new BaseResource(apiResponse.test_res[1]))
            testResource.subResources.testChild.get(testIDs[2]).should.deep.equal(new BaseResource(apiResponse.test_res[2]))
          })
      })
    })

    describe('getSubResource method tests', () => {
      before(() => {
        BaseResource.children = {
          testChild: {
            path: (resID) => `/testRes/${resID}/testChild`,
            key: 'test_res',
            id: 'resource_id',
            Class: BaseResource
          }
        }
      })

      it('should return the subResource from the corresponding subResourceMap if it exists and has the subResource', () => {
        const testResourceID = uuid()
        const testResource = new BaseResource(testResourceID, { api: testAxios })

        const testID = uuid()
        const testSubResource = new BaseResource(testID)
        testResource.subResources = {
          testChild: new Map([[testID, testSubResource]])
        }

        return testResource.getSubResource('testChild', testID)
          .then(res => {
            res.should.equal(testSubResource)
          })
      })

      it('should call getSubResourceFromApi if the subResource is not in the Map', () => {
        const testResourceID = uuid()
        const testResource = new BaseResource(testResourceID, { api: testAxios })

        testResource.subResources = {
          testChild: new Map()
        }

        const testID = uuid()

        const fromApiStub = sandbox.stub(testResource, 'getSubResourceFromApi')
        fromApiStub.resolves(true)

        return testResource.getSubResource('testChild', testID)
          .then(() => {
            fromApiStub.should.have.been.calledWith('testChild', testID)
          })
      })

      it('should call getSubResourceFromApi if the Map is not defined', () => {
        const testResourceID = uuid()
        const testResource = new BaseResource(testResourceID, { api: testAxios })

        const testID = uuid()

        const fromApiStub = sandbox.stub(testResource, 'getSubResourceFromApi')
        fromApiStub.resolves(true)

        return testResource.getSubResource('testChild', testID)
          .then(() => {
            fromApiStub.should.have.been.calledWith('testChild', testID)
          })
      })
    })

    describe('getSubResourceFromApi method tests', () => {
      before(() => {
        BaseResource.children = {
          testChild: {
            path: (resID) => `/testRes/${resID}/testChild`,
            key: 'test_res',
            id: 'resource_id',
            Class: BaseResource
          }
        }
      })

      it('should call the child class get method', () => {
        const getStub = sandbox.stub(BaseResource.children.testChild.Class, 'get')
        getStub.returns({
          then: () => null
        })

        const testResourceID = uuid()
        const testResource = new BaseResource(testResourceID, { api: testAxios })

        const testID = uuid()

        testResource.getSubResourceFromApi('testChild', testID)
        getStub.should.have.been.calledWith(testResourceID, testID)
      })

      it('should add the child instance to the subResourceMap', () => {
        const testID = uuid()
        const getStub = sandbox.stub(BaseResource.children.testChild.Class, 'get')
        getStub.resolves(new BaseResource(testID))

        const testResourceID = uuid()
        const testResource = new BaseResource(testResourceID, { api: testAxios })
        testResource.subResources.testChild = new Map()

        return testResource.getSubResourceFromApi('testChild', testID)
          .then(() => {
            testResource.subResources.testChild.get(testID).should.be.an.instanceOf(BaseResource)
          })
      })

      it('should create a new Map if the subResourceMap is not defined', () => {
        const testID = uuid()
        const getStub = sandbox.stub(BaseResource.children.testChild.Class, 'get')
        getStub.resolves(new BaseResource(testID))

        const testResourceID = uuid()
        const testResource = new BaseResource(testResourceID, { api: testAxios })
        delete testResource.subResources.testChild

        return testResource.getSubResourceFromApi('testChild', testID)
          .then(() => {
            testResource.subResources.testChild.should.be.an.instanceOf(Map)
            testResource.subResources.testChild.get(testID).should.be.an.instanceOf(BaseResource)
          })
      })

      it('should resolve with the childInstance', () => {
        const testID = uuid()
        const testSubResource = new BaseResource(testID)
        const getStub = sandbox.stub(BaseResource.children.testChild.Class, 'get')
        getStub.resolves(testSubResource)

        const testResourceID = uuid()
        const testResource = new BaseResource(testResourceID, { api: testAxios })

        return testResource.getSubResourceFromApi('testChild', testID)
          .then((res) => {
            res.should.deep.equal(testSubResource)
          })
      })
    })
  })
})
