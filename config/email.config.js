module.exports = {
  emailFrom: "tnah@bulbtour.com",
  smtpOptions: {
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      type: 'OAuth2',
      user: "yellowdragon1999qn@gmail.com",
      clientId: '586327316542-9mtefisavm8ula4d4thbdu1391i2dhu5.apps.googleusercontent.com',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_CLIENT_REFRESH,
      accessToken: process.env.GOOGLE_CLIENT_TOKEN
    },
  },
};