module.exports = (sequelize, Sequelize) => {
  const Review = sequelize.define(
    "reviews",
    {
      ownerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      locationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      text: {
        type: Sequelize.STRING,
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          customValidator(value) {
            if (value === null || value < 1 || value > 5) {
              throw new Error("Rating out of box");
            }
          },
        },
      },
      canEditRating: {
        type: Sequelize.BOOLEAN,
        default: true,
      },
      pictures: {
        type: Sequelize.STRING,
        get() {
          return this.getDataValue("pictures")?.split(";") || [];
        },
        set(val) {
          this.setDataValue("pictures", Array.from(val).join(";"));
        },
      },
    },
    { 
      timestamps: false,
      indexes: [
        {
          name: 'public_by_author',
          fields: ['ownerId', 'locationId'],
        },
      ] 
    }
  );

  return Review;
};
