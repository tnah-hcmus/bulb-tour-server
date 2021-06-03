module.exports = {
  emailFrom: "tnah@bulbtour.com",
  smtpOptions: {
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: "yellowdragon1999qn@gmail.com",
      pass: process.env.MAIL_PASS,
    },
  },
};
