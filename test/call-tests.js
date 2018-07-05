const chai = require('chai')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(sinonChai)
chai.use(chaiAsPromised)
chai.should()

const sinon = require('sinon')
const sandbox = sinon.createSandbox()
const uuid = require('uuid/v4')

const User = require('../src/user')
const UserLoan = require('../src/user-loan')
const UserRequest = require('../src/user-request')

// Module under test
const AlmaClient = require('../src/alma-client')

let almaApi

describe('api call tests', () => {
  beforeEach(() => {
    almaApi = new AlmaClient({
      region: 'eu',
      apikey: 'key'
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('path: /users/<userID>', () => {
    it('should call the api with the correct path', () => {
      const testUserID = uuid()

      const axiosStub = sandbox.stub(almaApi.api, 'get')
      axiosStub.resolves({ primary_id: testUserID })

      return almaApi.users.get(testUserID)
        .then(() => {
          axiosStub.should.have.been.calledWith('/users/' + testUserID)
        })
    })

    it('should resolve with a User instance', () => {
      const testUserID = uuid()

      const axiosStub = sandbox.stub(almaApi.api, 'get')
      axiosStub.resolves({ primary_id: testUserID })

      return almaApi.users.get(testUserID)
        .then((res) => {
          res.should.be.an.instanceOf(User)
          res.data.should.deep.equal({ primary_id: testUserID })
          res.id.should.equal(testUserID)
        })
    })

    it('should handle an invalid username', () => {
      const axiosStub = sandbox.stub(almaApi.api, 'get')
      axiosStub.rejects(new Error('Request failed with status code 400'))

      return almaApi.users.get(uuid()).should.eventually.be.rejectedWith('Request failed with status code 400')
    })
  })

  describe('path: /users/<userID>/loans', () => {
    it('should call the api with the correct path', () => {
      const testUserID = uuid()

      const axiosStub = sandbox.stub(almaApi.api, 'get')
      axiosStub.resolves({ item_loan: [] })

      return almaApi.users.for(testUserID).loans()
        .then(() => {
          axiosStub.should.have.been.calledWith('/users/' + testUserID + '/loans')
        })
    })

    it('should resolve with a Map of UserLoan instances', () => {
      const testUserID = uuid()
      const testLoanIDs = [uuid(), uuid(), uuid()]

      const apiresponse = {
        item_loan: [
          {
            loan_id: testLoanIDs[0],
            userID: testUserID,
            title: uuid()
          }, {
            loan_id: testLoanIDs[1],
            userID: testUserID,
            title: uuid()
          }, {
            loan_id: testLoanIDs[2],
            userID: testUserID,
            title: uuid()
          }
        ]
      }

      const axiosStub = sandbox.stub(almaApi.api, 'get')
      axiosStub.resolves(apiresponse)

      return almaApi.users.for(testUserID).loans()
        .then((res) => {
          res.should.be.an.instanceOf(Map)
          for (let i = 0; i < 3; i++) {
            res.get(testLoanIDs[i]).should.be.an.instanceOf(UserLoan)
            res.get(testLoanIDs[i]).data.should.deep.equal(apiresponse.item_loan[i])
          }
        })
    })

    it('should handle an empty response', () => {
      const testUserID = uuid()

      const apiResponse = {
        total_record_count: 0
      }

      const axiosStub = sandbox.stub(almaApi.api, 'get')
      axiosStub.resolves(apiResponse)

      return almaApi.users.for(testUserID).loans()
        .then((res) => {
          res.should.be.an.instanceOf(Map)
          res.size.should.equal(0)
        })
    })
  })

  describe('path: /users/<userID>/loans/<loanID>', () => {
    it('should call the api with the correct path', () => {
      const testUserID = uuid()
      const testLoanID = uuid()

      const axiosStub = sandbox.stub(almaApi.api, 'get')
      axiosStub.resolves({ loan_id: testLoanID })

      return almaApi.users.for(testUserID).getLoan(testLoanID)
        .then(() => {
          axiosStub.should.have.been.calledWith('/users/' + testUserID + '/loans/' + testLoanID)
        })
    })

    it('should resolve with a Loan instance', () => {
      const testUserID = uuid()
      const testLoanID = uuid()

      const axiosStub = sandbox.stub(almaApi.api, 'get')
      axiosStub.resolves({ loan_id: testLoanID })

      return almaApi.users.for(testUserID).getLoan(testLoanID)
        .then((res) => {
          res.should.be.an.instanceOf(UserLoan)
          res.data.should.deep.equal({ loan_id: testLoanID })
          res.id.should.equal(testLoanID)
        })
    })

    it('should handle an invalid loan ID', () => {
      const axiosStub = sandbox.stub(almaApi.api, 'get')
      axiosStub.rejects(new Error('Request failed with status code 500'))

      return almaApi.users.for(uuid()).getLoan(uuid()).should.eventually.be.rejectedWith('Request failed with status code 500')
    })
  })

  describe('path: /users/<userID>/requests', () => {
    it('should call the api with the correct path', () => {
      const testUserID = uuid()

      const axiosStub = sandbox.stub(almaApi.api, 'get')
      axiosStub.resolves({ user_request: [] })

      return almaApi.users.for(testUserID).requests()
        .then(() => {
          axiosStub.should.have.been.calledWith('/users/' + testUserID + '/requests')
        })
    })

    it('should resolve with a Map of UserRequest instances', () => {
      const testUserID = uuid()
      const testRequestIDs = [uuid(), uuid(), uuid()]

      const apiResponse = {
        user_request: [
          {
            request_id: testRequestIDs[0],
            userID: testUserID,
            title: uuid()
          }, {
            request_id: testRequestIDs[1],
            userID: testUserID,
            title: uuid()
          }, {
            request_id: testRequestIDs[2],
            userID: testUserID,
            title: uuid()
          }
        ]
      }

      const axiosStub = sandbox.stub(almaApi.api, 'get')
      axiosStub.resolves(apiResponse)

      return almaApi.users.for(testUserID).requests()
        .then((res) => {
          res.should.be.an.instanceOf(Map)
          for (let i = 0; i < 3; i++) {
            res.get(testRequestIDs[i]).should.be.an.instanceOf(UserRequest)
            res.get(testRequestIDs[i]).data.should.deep.equal(apiResponse.user_request[i])
          }
        })
    })

    it('should handle an empty response', () => {
      const testUserID = uuid()

      const apiResponse = {
        total_record_count: 0
      }

      const axiosStub = sandbox.stub(almaApi.api, 'get')
      axiosStub.resolves(apiResponse)

      return almaApi.users.for(testUserID).requests()
        .then((res) => {
          res.should.be.an.instanceOf(Map)
          res.size.should.equal(0)
        })
    })
  })

  describe('path: /users/<userID>/requests/<requestID>', () => {
    it('should call the api with the correct path', () => {
      const testUserID = uuid()
      const testRequestID = uuid()

      const axiosStub = sandbox.stub(almaApi.api, 'get')
      axiosStub.resolves({ request_id: testRequestID })

      return almaApi.users.for(testUserID).getRequest(testRequestID)
        .then(() => {
          axiosStub.should.have.been.calledWith('/users/' + testUserID + '/requests/' + testRequestID)
        })
    })

    it('should resolve with a Request instance', () => {
      const testUserID = uuid()
      const testRequestID = uuid()

      const axiosStub = sandbox.stub(almaApi.api, 'get')
      axiosStub.resolves({ request_id: testRequestID })

      return almaApi.users.for(testUserID).getRequest(testRequestID)
        .then((res) => {
          res.should.be.an.instanceOf(UserRequest)
          res.data.should.deep.equal({ request_id: testRequestID })
          res.id.should.equal(testRequestID)
        })
    })

    it('should handle an invalid loan ID', () => {
      const axiosStub = sandbox.stub(almaApi.api, 'get')
      axiosStub.rejects(new Error('Request failed with status code 500'))

      return almaApi.users.for(uuid()).getRequest(uuid()).should.eventually.be.rejectedWith('Request failed with status code 500')
    })
  })
})
