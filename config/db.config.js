module.exports = {
  HOST: "localhost",
  USER: "thesis",
  DB: "bulbtour",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
