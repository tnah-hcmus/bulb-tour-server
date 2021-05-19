module.exports = {
  HOST: "localhost",
  USER: "thesis",
  PASSWORD: process.env.MYSQL_PASSWORD,
  DB: "bulbtour",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
