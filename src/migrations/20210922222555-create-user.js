module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      username: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      profilePhoto: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'https://res.cloudinary.com/jack6688/image/upload/v1638571247/trainer_1_ocv1qk.png',
      },
      mail: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
      },
      objective: {
        type: Sequelize.STRING,
        default: 'None',
      },
      isCertified: {
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      profession: {
        type: Sequelize.STRING,
      },
      hashedId: {
        type: Sequelize.STRING,
      },
      isAdmin: {
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  },
};
