const User = require('./User');
const Project = require('./Project');
const ProjectMember = require('./ProjectMember');
const List = require('./List');
const Task = require('./Task');
const Comment = require('./Comment');

User.hasMany(Project, { foreignKey: 'created_by', as: 'createdProjects' });
Project.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.belongsToMany(Project, { through: ProjectMember, foreignKey: 'user_id', as: 'projects' });
Project.belongsToMany(User, { through: ProjectMember, foreignKey: 'project_id', as: 'members' });

Project.hasMany(List, { foreignKey: 'project_id', as: 'lists', onDelete: 'CASCADE' });
List.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

List.hasMany(Task, { foreignKey: 'list_id', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(List, { foreignKey: 'list_id', as: 'list' });

User.hasMany(Task, { foreignKey: 'assigned_to', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

Task.hasMany(Comment, { foreignKey: 'task_id', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });

User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

module.exports = {
  User,
  Project,
  ProjectMember,
  List,
  Task,
  Comment
};