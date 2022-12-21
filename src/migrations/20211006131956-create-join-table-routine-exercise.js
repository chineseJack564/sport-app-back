module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('routine_exercises', {
      routineId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        reference: {
          model: 'routines',
          key: 'id',
        },
      },
      exerciseId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        reference: {
          model: 'exercises',
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

  down: async (queryInterface) => queryInterface.dropTable('routine_exercises'),
};
