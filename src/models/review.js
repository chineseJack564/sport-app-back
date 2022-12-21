const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user);
      this.belongsTo(models.routine);
    }
  }
  review.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    routineId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 5,
      },
    },

    content: {
      type: DataTypes.STRING,
    },

    isReported: {
      type: DataTypes.INTEGER,
    },

  }, {
    sequelize,
    modelName: 'review',
  });
  return review;
};
