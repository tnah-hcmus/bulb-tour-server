module.exports = (sequelize, Sequelize) => {
  const Location = sequelize.define(
    "locations",
    {
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      shortDesc: {
        type: Sequelize.STRING,
      },
      longDesc: {
        type: Sequelize.STRING,
      },
      phone: {
        type: Sequelize.STRING,
      },
      web: {
        type: Sequelize.STRING,
      },
      rating: {
        type: Sequelize.DOUBLE,
        default: -1,
        validate: {
          customValidator(value) {
            if (value !== -1 && (value < 0 || value > 5)) {
              throw new Error("Rating out of box");
            }
          },
        },
      },
      ratingNumber: {
        type: Sequelize.INTEGER,
        default: 0,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lat: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      long: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      hash: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.STRING,
      },
      openTime: {
        type: Sequelize.INTEGER,
        customValidator(value) {
          if (value === null || value < 0 || value > 24) {
            throw new Error("open time out of box");
          }
        },
      },
      closeTime: {
        type: Sequelize.INTEGER,
        customValidator(value) {
          if (value === null || value < 0 || value > 24) {
            throw new Error("close time out of box");
          }
        },
      },
      pictures: {
        type: Sequelize.STRING,
        get() {
          return this.getDataValue("pictures")?.split(";") || [];
        },
        set(val) {
          if (Array.isArray(val)) val = new Set(val);
          this.setDataValue("pictures", Array.from(val).join(";"));
        },
      },
    },
    { timestamps: false }
  );

  return Location;
};
