module.exports = (sequelize, Sequelize) => {
  const Tour = sequelize.define("tours", {
    ownerId: {
      type: Sequelize.INTEGER,
    },
    rating: {
      type: Sequelize.INTEGER,
      validate: {
        customValidator(value) {
          if (value === null || value < 1 || value > 5) {
            throw new Error("Rating out of box");
          }
        },
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
    status: {
      //0 in progress, //1 done, //2 interupted
      type: Sequelize.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 2,
      },
    },
    started: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    end: {
      type: Sequelize.DATE,
    },
    currentLocation: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    locations: {
      type: Sequelize.STRING,
      get() {
        return this.getDataValue("locations")?.split(";") || [];
      },
      set(val) {
        if (Array.isArray(val)) val = new Set(val);
        this.setDataValue("locations", Array.from(val).join(";"));
      },
    },
  });

  return Tour;
};
