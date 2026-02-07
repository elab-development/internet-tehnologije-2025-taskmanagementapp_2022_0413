'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('projects', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_projects_created_by',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('project_members', {
      fields: ['project_id'],
      type: 'foreign key',
      name: 'fk_project_members_project',
      references: {
        table: 'projects',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('project_members', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_project_members_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('lists', {
      fields: ['project_id'],
      type: 'foreign key',
      name: 'fk_lists_project',
      references: {
        table: 'projects',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('tasks', {
      fields: ['list_id'],
      type: 'foreign key',
      name: 'fk_tasks_list',
      references: {
        table: 'lists',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('tasks', {
      fields: ['assigned_to'],
      type: 'foreign key',
      name: 'fk_tasks_assigned_to',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('comments', {
      fields: ['task_id'],
      type: 'foreign key',
      name: 'fk_comments_task',
      references: {
        table: 'tasks',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('comments', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_comments_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('projects', 'fk_projects_created_by');
    await queryInterface.removeConstraint('project_members', 'fk_project_members_project');
    await queryInterface.removeConstraint('project_members', 'fk_project_members_user');
    await queryInterface.removeConstraint('lists', 'fk_lists_project');
    await queryInterface.removeConstraint('tasks', 'fk_tasks_list');
    await queryInterface.removeConstraint('tasks', 'fk_tasks_assigned_to');
    await queryInterface.removeConstraint('comments', 'fk_comments_task');
    await queryInterface.removeConstraint('comments', 'fk_comments_user');
  }
};