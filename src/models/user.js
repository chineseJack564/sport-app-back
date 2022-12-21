const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

const SaltRound = 10;

module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.routine);
      // this.hasMany(models.post);
      this.hasMany(models.exercise);
      // this.hasMany(models.comment);
      this.hasMany(models.review);

      this.belongsToMany(models.routine, {
        through: 'user_favroutines',
        as: 'favorite',
      });
    }

    async checkPassword(password) {
      const result = await bcrypt.compare(password, this.password);
      return result;
    }

    async checkID(ID) {
      if (ID !== null) {
        return bcrypt.compare(this.id.toString(), ID);
      }

      return false;
    }

    async getHashID() {
      const sId = this.id.toString();
      const hash = await bcrypt.hash(sId, SaltRound);
      return hash;
    }
  }
  user.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg: 'Username already exists',
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [4, 200],
        },
      },
      mail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
        unique: {
          args: true,
          msg: 'Mail already exists',
        },
      },
      profilePhoto: DataTypes.STRING,
      objective: DataTypes.STRING,
      isCertified: DataTypes.INTEGER,
      profession: DataTypes.STRING,
      isAdmin: DataTypes.INTEGER,
      hashedId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'user',
    },
  );

  user.beforeSave(async (instance) => {
    if (instance.changed('password')) {
      const hash = await bcrypt.hash(instance.password, SaltRound);
      instance.set('password', hash);
    }
  });

  return user;
};
