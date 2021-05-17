module.exports = (sequelize, Sequelize) => {
  const Upload = sequelize.define("uploads", {
    uploadId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    fileName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    imageId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    thumbnailId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  });
  return Upload;
};
