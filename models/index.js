const config = require("config/db.config.js");

const Sequelize = require("sequelize");

const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  port: config.PORT,
  dialect: config.dialect,
  operatorsAliases: false,

  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,
    idle: config.pool.idle,
  },
  logging: false
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("models/user.model.js")(sequelize, Sequelize);
db.location = require("models/location.model.js")(sequelize, Sequelize);
db.review = require("models/review.model.js")(sequelize, Sequelize);
db.refreshToken = require("models/refreshToken.model.js")(sequelize, Sequelize);
db.tour = require("models/tour.model.js")(sequelize, Sequelize);
db.upload = require("models/upload.model.js")(sequelize, Sequelize);
db.image = require("models/image.model.js")(sequelize, Sequelize);

//User constraint
db.user.hasMany(db.refreshToken, { onDelete: "CASCADE" });
db.refreshToken.belongsTo(db.user);

db.user.hasMany(db.tour, { onDelete: "CASCADE", foreignKey: "ownerId" });
db.tour.belongsTo(db.user, {foreignKey: "ownerId"});

db.user.hasMany(db.image, { onDelete: "CASCADE", foreignKey: "ownerId" });
db.image.belongsTo(db.user, {foreignKey: "ownerId"});

db.user.hasMany(db.review, { onDelete: "CASCADE", foreignKey: "ownerId" });
db.review.belongsTo(db.user, {foreignKey: "ownerId"});

db.user.hasOne(db.upload, { onDelete: "CASCADE", foreignKey: "avatar" });
db.upload.belongsTo(db.user, {foreignKey: "avatar"});
//--------------------------//

//Location constraint
db.location.hasMany(db.review, { onDelete: "CASCADE" });
db.review.belongsTo(db.location);

db.location.hasMany(db.tour, {
  onDelete: "CASCADE",
  foreignKey: "currentLocation",
});
db.tour.belongsTo(db.location, {foreignKey: "currentLocation"});
//--------------------------//

//Upload constraint
db.upload.hasMany(db.image, { onDelete: "CASCADE" });
db.image.belongsTo(db.upload);

db.upload.hasMany(db.image, { onDelete: "CASCADE", foreignKey: "thumbnailId" });
db.image.belongsTo(db.upload,  {foreignKey: "thumbnailId"});
//--------------------------//

module.exports = db;
