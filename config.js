let secrets = require('secrets.js');

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
      statusToMatch: 'Connected'
    },
    wrn2000v5: {
    }
  },
  amazon: {
    headless: false
  },
  nodemailer: secrets.nodemailer
}
