let secrets = require('./secrets');

module.exports = {
  detect: {
    type: 'csv',
    csv: {
      csv_url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQUm3wQU5CHEFXxEUF_EhbAT5rQDEadodvmq4KNRq2hMIcCFgf6VXi1Wxwk6m4PvYYQKbP3ouOvQa9T/pub?output=csv',
      csv_indexes: {
        date: 0,
        deviceId: 1,
        statusId: 2
      },
      statusToMatch: 'Connected',
      datePattern: 'MMMM D, YYYY at hh:mma'
    },
    wrn2000v5: {
    }
  },
  amazon: {
    headless: true,
    emailOnDone: 'daniellmorris@gmail.com'
  },
  nodemailer: (secrets||{}).nodemailer
}
