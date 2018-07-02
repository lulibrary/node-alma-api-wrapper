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
const UserRequest = require('../src/user-request')
const BaseResource = require('../src/base-resource')

// Module under test
const UserLoan = require('../src/user-loan')

const testAxios = new AlmaAxios({
  region: 'eu',
  key: 'secretkey'
})

describe('user-loan class tests', () => {
  afterEach(() => {
    sandbox.restore()
  })

  describe('configuration tests', () => {
    let CleanUserLoan

    before(() => {
      delete require.cache[require.resolve('../src/user-loan')]
      CleanUserLoan = require('../src/user-loan')
    })

    it('should have the ID "loan_id"', () => {
      CleanUserLoan.config.id.should.equal('loan_id')
    })

    it('should have path function `/users/<userID>/loans/<loanID>`', () => {
      for (let i = 0; i < 100; i++) {
        const testUserID = uuid()
        const testLoanID = uuid()

        CleanUserLoan.config.path(testUserID, testLoanID).should.equal('/users/' + testUserID + '/loans/' + testLoanID)
      }
    })
  })
})
