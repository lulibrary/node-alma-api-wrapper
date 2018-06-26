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
const Loan = require('../src/loan')

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
      it('should call the api with the correct path', () => {
        const getStub = sandbox.stub(testAxios, 'get')
        getStub.resolves(true)

        const testUserID = uuid()

        return User.get(testUserID, testAxios)
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
  })

  describe('instance method tests', () => {
    before(() => {
      User.setConfig({ api: testAxios })
    })

    after(() => {
      User.config = {}
    })

    describe('loan method tests', () => {
      it('should return the User loans if it exists on the resources object', () => {
        const testUserID = uuid()
        const testUser = new User({ primary_id: testUserID })

        const apiGetStub = sandbox.stub(testUser.config, 'api')

        testUser.resources.loans = [uuid(), uuid(), uuid()]

        return testUser.loans().then((data) => {
          data.should.deep.equal(testUser.resources.loans)
          apiGetStub.should.not.have.been.called
        })
      })

      it('should call get on the api with the user-loans path', () => {
        const testUserID = uuid()
        const testUser = new User({ primary_id: testUserID })

        const apiGetStub = sandbox.stub(testAxios, 'get')
        apiGetStub.resolves({ item_loan: [] })

        return testUser.loans().then(() => {
          apiGetStub.should.have.been.calledWith(`/users/${testUserID}/loans/`)
        })
      })

      it('should return a map of Loan instances', () => {
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
          Array.from(loans.values()).forEach(loan => loan.should.be.an.instanceOf(Loan))
        })
      })
    })
  })
})
