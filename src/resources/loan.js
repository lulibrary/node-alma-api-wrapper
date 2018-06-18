const Resource = require('./resource')

class Loan extends Resource {
  constructor (path, api, loanID) {
    super(path, api, 'loans', loanID)
  }

  getComplete () {
    return this.get()
      .then((data) => {
        return data.item_loan.map(loan => {
          console.log(loan.loan_id)
          return this.get(loan.loan_id)
        })
      })
      .then(promises => Promise.all(promises))
  }
}

module.exports = Loan