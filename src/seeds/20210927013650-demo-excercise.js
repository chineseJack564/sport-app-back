module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('routines', [{
      title: 'Demo-routine',
      description: 'This is only a demo',
      userId: 1,
      cathegory: 'Build muscle',
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('routines', null, {});
  },
};
