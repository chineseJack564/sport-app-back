module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('exercises', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.STRING,
      },
      workZoneP: {
        type: Sequelize.STRING,
      },
      workZoneS: {
        type: Sequelize.STRING,
        default: 'None',
      },
      coverId: {
        type: Sequelize.INTEGER,
      },
      cover: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'https://res.cloudinary.com/jack6688/image/upload/v1638841322/classes-2_r3mkrk.jpg',
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
    await queryInterface.dropTable('exercises');
  },
};
