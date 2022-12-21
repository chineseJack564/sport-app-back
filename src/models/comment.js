const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class comment extends Model {
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
  comment.init(
    {
      title: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true,
          len: [5, 60],
        },

      },
      content: {
        type: DataTypes.STRING,
      },
      rating: { type: DataTypes.INTEGER, allowNull: false },
      userId: DataTypes.INTEGER,
      routineId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'comment',
    },
  );
  return comment;
};
