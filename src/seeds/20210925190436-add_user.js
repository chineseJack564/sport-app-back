const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface) => {
    const usersArray = [];

    usersArray.push({
      id: '0',
      username: 'admin',
      password: bcrypt.hashSync('admin123', 10),
      mail: 'admin@uc.cl',
      objective: 'muscle',
      hashedId: bcrypt.hashSync('0', 10),
      isAdmin: '1',
      isCertified: '0',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    usersArray.push({
      id: '1',
      username: 'Jackyan',
      password: bcrypt.hashSync('123456', 10),
      mail: '1@uc.cl',
      objective: 'muscle',
      hashedId: bcrypt.hashSync('1', 10),
      isAdmin: '0',
      isCertified: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    usersArray.push({
      id: '2',
      username: 'nfraga',
      password: bcrypt.hashSync('123456', 10),
      mail: '2@uc.cl',
      objective: 'muscle',
      hashedId: bcrypt.hashSync('2', 10),
      isAdmin: '0',
      isCertified: '0',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await queryInterface.bulkInsert('users', usersArray);
  },

  down: async () => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
