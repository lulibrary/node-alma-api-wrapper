const Resource = require('./resource')
const Loan = require('./loan')

class User extends Resource {
  loans () {
    if (this.resources.loans) {
      return Promise.resolve(this.resources.loans)
    } else {
      return this.config.api.get(`/users/${this.data.primary_id}/loans/`)
        .then((data) => {
          this.resources.loans = new Map()
          data.item_loan.forEach(loan => this.resources.loans.set(loan.loan_id, new Loan(loan)))
          return this.resources.loans
        })
    }
  }
}

User.config = {}

User.resource = {
  name: 'user',
  path: 'users',
  Class: User
}

module.exports = User
