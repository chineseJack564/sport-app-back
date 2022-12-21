const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class exercise extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.user);
      this.belongsToMany(models.routine, {
        through: 'routine_exercises',
      });
    }
  }
  exercise.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [5, 60],
      },
    },

    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [0, 300],
      },
    },

    workZoneP: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    workZoneS: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    cover: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'https://res.cloudinary.com/jack6688/image/upload/v1638841322/classes-2_r3mkrk.jpg',
    },

    coverId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
  },

  {
    sequelize,
    modelName: 'exercise',
  });
  return exercise;
};
