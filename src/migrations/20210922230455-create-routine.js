module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('routines', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.STRING,
      },
      cover: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'https://res.cloudinary.com/jack6688/image/upload/v1638540603/DefaultCoverR_xwziq6.jpg',
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      cathegory: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('routines');
  },
};
