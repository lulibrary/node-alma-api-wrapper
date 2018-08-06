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
const UserLoan = require('../src/user-loan')
const UserRequest = require('../src/user-request')
const BaseResource = require('../src/base-resource')

// Module under test
const User = require('../src/user')

const testAxios = new AlmaAxios({
  region: 'eu',
  key: 'secretkey'
})

describe('User class tests', () => {
  afterEach(() => {
    sandbox.restore()
  })

  describe('static method tests', () => {
    describe('get method tests', () => {
      before(() => {
        User.config.api = testAxios
      })

      after(() => {
        delete User.config.api
      })

      it('should call the api with the correct path', () => {
        const getStub = sandbox.stub(testAxios, 'get')
        getStub.resolves(true)

        const testUserID = uuid()

        return User.get(testUserID)
          .then(() => {
            getStub.should.have.been.calledWith(`/users/${testUserID}`)
          })
      })

      it('should resolve with a new User instance', () => {
        const testUserID = uuid()
        const testUserData = {
          primary_id: testUserID,
          loan_ids: [uuid(), uuid()]
        }
        const getStub = sandbox.stub(testAxios, 'get')
        getStub.resolves(testUserData)

        return User.get(testUserID, testAxios)
          .then(user => {
            user.should.be.an.instanceOf(User)
            user.config.api.should.deep.equal(testAxios)
          })
      })
    })

    describe('for method tests', () => {
      it('should return a new User instance', () => {
        const testUserID = uuid()
        const result = User.for(testUserID)

        result.should.be.an.instanceof(User)
        result.data.should.deep.equal({ primary_id: testUserID })
      })
    })

    describe('new method tests', () => {
      it('should return a new User instance', () => {
        const testUserID = uuid()
        const result = User.new(testUserID)

        result.should.be.an.instanceof(User)
        result.data.should.deep.equal({ primary_id: testUserID })
      })
    })

    describe('setConfig method tests', () => {
      it('should overwrite all provided properties in the config', () => {
        User.config = {
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

        User.setConfig(newConfig)

        User.config.should.deep.equal(newConfig)
      })

      it('should not replace any properties not provided', () => {
        User.config = {}
        const param1 = `new_value_${uuid()}`
        const param2 = {
          test1: `new_value_${uuid()}`,
          test2: `old_value_${uuid()}`
        }
        const param3 = `old_value_${uuid()}`

        User.config = {
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

        User.setConfig(newConfig)

        User.config.should.deep.equal(expected)
      })

      it('should apply the new config to new User instances', () => {
        User.config = {}
        const newConfig = {
          param1: `new_value_${uuid()}`,
          param2: `new_value_${uuid()}`,
          param3: {
            test: `new_value_${uuid()}`
          },
          param4: `new_value_${uuid()}`
        }
        User.setConfig(newConfig)

        const testUser = new User({ primary_id: uuid() })
        testUser.config.should.deep.equal(newConfig)
      })

      it('should return the User class', () => {
        User.config = {}
        const newConfig = {
          param1: `new_value_${uuid()}`,
          param2: `new_value_${uuid()}`,
          param3: {
            test: `new_value_${uuid()}`
          },
          param4: `new_value_${uuid()}`
        }
        const result = User.setConfig(newConfig)

        result.should.deep.equal(User)
      })

      it('should not alter the resource config property', () => {
        delete require.cache[require.resolve('../src/user')]
        const NewUser = require('../src/user')
        NewUser.config = {}
        NewUser.children = {}

        BaseResource.config = {}
        const testConfig = {
          test: 'test',
          test2: uuid()
        }

        NewUser.setConfig(testConfig)

        NewUser.config.should.deep.equal(testConfig)
        BaseResource.config.should.deep.equal({})
      })
    })
  })

  describe('instance method tests', () => {
    before(() => {
      User.config = {
        path: (userID) => `/users/${userID}`,
        id: 'primary_id'
      }
      User.setConfig({ api: testAxios })
    })

    after(() => {
      User.config = {}
    })

    describe('loans method tests', () => {
      it('should return the User loans if it exists on the resources object', () => {
        const testUserID = uuid()
        const testUser = new User({ primary_id: testUserID })

        const apiGetStub = sandbox.stub(testUser.config, 'api')

        testUser.subResources.loans = new Map([[uuid(), uuid()], [uuid(), uuid()], [uuid(), uuid()]])

        return testUser.loans().then((data) => {
          data.should.deep.equal(testUser.subResources.loans)
          apiGetStub.should.not.have.been.called
        })
      })

      it('should call get on the api with the user-loans path', () => {
        const testUserID = uuid()
        const testUser = new User({ primary_id: testUserID })

        const apiGetStub = sandbox.stub(testAxios, 'get')
        apiGetStub.resolves({ item_loan: [] })

        return testUser.loans().then(() => {
          apiGetStub.should.have.been.calledWith(`/users/${testUserID}/loans`)
        })
      })

      it('should return a map of UserLoan instances', () => {
        const testUserID = uuid()
        const testUser = new User({ primary_id: testUserID })

        const testLoanIDs = [uuid(), uuid(), uuid()]
        const testLoans = [
          {
            loan_id: testLoanIDs[0],
            user_id: testUserID
          }, {
            loan_id: testLoanIDs[1],
            user_id: testUserID
          }, {
            loan_id: testLoanIDs[2],
            user_id: testUserID
          }
        ]

        const apiGetStub = sandbox.stub(testAxios, 'get')
        apiGetStub.resolves({ item_loan: testLoans })

        return testUser.loans().then((loans) => {
          loans.should.be.an.instanceOf(Map)
          Array.from(loans.keys()).should.deep.equal(testLoanIDs)
          Array.from(loans.values()).forEach(loan => loan.should.be.an.instanceOf(UserLoan))
        })
      })

      it('should call BaseResource#_getSubResourceMap with parameter "loans"', () => {
        const testUserID = uuid()
        const testUser = new User({ primary_id: testUserID })

        const getSubStub = sandbox.stub(BaseResource.prototype, '_getSubResourceMap')
        getSubStub.resolves(true)

        return testUser.loans().then(() => {
          getSubStub.should.have.been.calledWith('loans')
        })
      })
    })

    describe('requests method tests', () => {
      it('should call BaseResource#_getSubResourceMap with parameter "requests"', () => {
        const testUserID = uuid()
        const testUser = new User({ primary_id: testUserID })

        const getSubStub = sandbox.stub(BaseResource.prototype, '_getSubResourceMap')
        getSubStub.resolves(true)

        return testUser.requests().then(() => {
          getSubStub.should.have.been.calledWith('requests')
        })
      })

      it('should call get on the api with the user-requests path', () => {
        const testUserID = uuid()
        const testUser = new User({ primary_id: testUserID })

        const apiGetStub = sandbox.stub(testAxios, 'get')
        apiGetStub.resolves({ user_request: [] })

        return testUser.requests().then(() => {
          apiGetStub.should.have.been.calledWith(`/users/${testUserID}/requests`)
        })
      })
    })

    describe('getLoanFromApi method tests', () => {
      describe('should call _getSubResourceFromApi', () => {
        const testUserID = uuid()
        const testUser = new User({ primary_id: testUserID })
        const testLoanID = uuid()

        const fromApiStub = sandbox.stub(testUser, '_getSubResourceFromApi')
        fromApiStub.resolves()

        return testUser.getLoanFromApi(testLoanID)
          .then(() => {
            fromApiStub.should.have.been.calledWith('loans', testLoanID)
          })
      })
    })

    describe('getRequestFromApi method tests', () => {
      describe('should call _getSubResourceFromApi', () => {
        const testUserID = uuid()
        const testUser = new User({ primary_id: testUserID })
        const testRequestID = uuid()

        const fromApiStub = sandbox.stub(testUser, '_getSubResourceFromApi')
        fromApiStub.resolves()

        return testUser.getRequestFromApi(testRequestID)
          .then(() => {
            fromApiStub.should.have.been.calledWith('requests', testRequestID)
          })
      })
    })

    describe('getFeeFromApi method tests', () => {
      describe('should call _getSubResourceFromApi', () => {
        const testUserID = uuid()
        const testUser = new User({ primary_id: testUserID })
        const testFeeID = uuid()

        const fromApiStub = sandbox.stub(testUser, '_getSubResourceFromApi')
        fromApiStub.resolves()

        return testUser.getFeeFromApi(testFeeID)
          .then(() => {
            fromApiStub.should.have.been.calledWith('fees', testFeeID)
          })
      })
    })
  })

  describe('configuration tests', () => {
    let CleanUser
    let CleanUserLoan

    before(() => {
      delete require.cache[require.resolve('../src/user')]
      delete require.cache[require.resolve('../src/user-loan')]
      CleanUser = require('../src/user')
      CleanUserLoan = require('../src/user-loan')
    })

    it('should have id "primary_id"', () => {
      CleanUser.config.id.should.equal('primary_id')
    })

    it('should have path function `/users/<userID>`', () => {
      for (let i = 0; i < 100; i++) { // Test multiple different inputs
        const testID = uuid()
        CleanUser.config.path(testID).should.equal('/users/' + testID)
      }
    })

    it('should have children "loans" and "requests"', () => {
      CleanUser.children.should.have.property('loans')
      CleanUser.children.should.have.property('requests')
    })

    it('should have the correct loans child config', () => {
      CleanUser.children.loans.almaResourceName.should.equal('item_loan')
      CleanUser.children.loans.almaResourceID.should.equal('loan_id')
      CleanUser.children.loans.Class.should.deep.equal(CleanUserLoan)
    })

    it('should have the correct requests child config', () => {
      CleanUser.children.requests.almaResourceName.should.equal('user_request')
      CleanUser.children.requests.almaResourceID.should.equal('request_id')
      CleanUser.children.requests.Class.should.deep.equal(UserRequest)
    })
  })
})
