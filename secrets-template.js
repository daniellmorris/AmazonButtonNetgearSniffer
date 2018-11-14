
module.exports = {
  nodemailer: {
    setup: [
      'SMTP',
      {
        service: "Gmail",
        auth: {
            user: "******@gmail.com",
            pass: "*****"
        }
      }
    ]
  }
}
