'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('users', [
      {
        name: 'Admin User',
        email: 'admin@taskapp.com',
        password: hashedPassword,
        role: 'admin',
        created_at: new Date()
      },
      {
        name: 'Project Manager',
        email: 'manager@taskapp.com',
        password: await bcrypt.hash('manager123', 10),
        role: 'project_manager',
        created_at: new Date()
      },
      {
        name: 'Regular User',
        email: 'user@taskapp.com',
        password: await bcrypt.hash('user123', 10),
        role: 'user',
        created_at: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', {
      email: ['admin@taskapp.com', 'manager@taskapp.com', 'user@taskapp.com']
    });
  }
};