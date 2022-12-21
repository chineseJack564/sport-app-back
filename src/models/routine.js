const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class routine extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user);
      this.hasMany(models.review);
      this.belongsToMany(models.exercise, {
        through: 'routine_exercises',
      });
      this.belongsToMany(models.user, {
        through: 'user_favroutines',
        as: 'liker',
      });
    }
  }
  routine.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [5, 100],
      },

    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [5, 10000],
      },
    },
    cover: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    cathegory: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'routine',
  });
  return routine;
};
