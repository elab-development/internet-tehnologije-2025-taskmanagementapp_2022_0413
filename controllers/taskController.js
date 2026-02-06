const { Task, List, Project, ProjectMember, User } = require('../models');
const { Op } = require('sequelize');

exports.getAllTasks = async (req, res) => {
  try {
    const { search, priority, status, assigned_to, deadline } = req.query;

    let whereClause = {};
    
    if (search) {
      whereClause.title = { [Op.like]: `%${search}%` };
    }
    if (priority) whereClause.priority = priority;
    if (status) whereClause.status = status;
    if (assigned_to) whereClause.assigned_to = assigned_to;
    if (deadline) whereClause.deadline = deadline;

    const tasks = await Task.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { 
          model: List, 
          as: 'list',
          include: [{ model: Project, as: 'project' }]
        }
      ],
      order: [['position', 'ASC']]
    });

    const filteredTasks = [];
    for (const task of tasks) {
      const project = task.list.project;
      const isMember = await ProjectMember.findOne({
        where: { project_id: project.id, user_id: req.user.id }
      });

      if (isMember || project.created_by === req.user.id || req.user.role === 'admin') {
        filteredTasks.push(task);
      }
    }

    res.json(filteredTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTasksByList = async (req, res) => {
  try {
    const { listId } = req.params;

    const tasks = await Task.findAll({
      where: { list_id: listId },
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }
      ],
      order: [['position', 'ASC']]
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { 
          model: List, 
          as: 'list',
          include: [{ model: Project, as: 'project' }]
        }
      ]
    });

    if (!task) {
      return res.status(404).json({ error: 'Zadatak nije pronađen.' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { list_id, title, description, priority, assigned_to, deadline } = req.body;

    const list = await List.findByPk(list_id, {
      include: [{ model: Project, as: 'project' }]
    });

    if (!list) {
      return res.status(404).json({ error: 'Lista nije pronađena.' });
    }

    const isMember = await ProjectMember.findOne({
      where: { project_id: list.project.id, user_id: req.user.id }
    });

    if (!isMember && list.project.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Nemate dozvolu za kreiranje zadataka.' });
    }

    if (deadline && list.project.deadline) {
      const taskDeadline = new Date(deadline);
      const projectDeadline = new Date(list.project.deadline);
      
      if (taskDeadline > projectDeadline) {
        return res.status(400).json({ 
          error: `Rok zadatka ne može biti posle roka projekta (${projectDeadline.toLocaleDateString('sr-RS')})` 
        });
      }
    }

    let finalAssignedTo = assigned_to;
    const isManager = list.project.created_by === req.user.id || req.user.role === 'admin' || req.user.role === 'project_manager';
    
    if (!isManager) {
      finalAssignedTo = req.user.id;
    }

    const maxPosition = await Task.max('position', { where: { list_id } }) || 0;

    const task = await Task.create({
      list_id,
      title,
      description,
      priority: priority || 'srednji',
      assigned_to: finalAssignedTo,
      deadline,
      status: 'planirano',
      position: maxPosition + 1
    });

    res.status(201).json({
      message: 'Zadatak kreiran.',
      task
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, priority, assigned_to, deadline, status, position, list_id } = req.body;
    
    const task = await Task.findByPk(req.params.id, {
      include: [
        { 
          model: List, 
          as: 'list',
          include: [{ model: Project, as: 'project' }]
        }
      ]
    });

    if (!task) {
      return res.status(404).json({ error: 'Zadatak nije pronađen.' });
    }

    const project = task.list.project;

    const isMember = await ProjectMember.findOne({
      where: { project_id: project.id, user_id: req.user.id }
    });

    const isManager = project.created_by === req.user.id || req.user.role === 'admin' || req.user.role === 'project_manager';
    const isAssignee = task.assigned_to === req.user.id;

    if (!isManager && !isAssignee) {
      return res.status(403).json({ error: 'Nemate dozvolu za izmenu ovog zadatka.' });
    }

    if (deadline && project.deadline) {
      const taskDeadline = new Date(deadline);
      const projectDeadline = new Date(project.deadline);
      
      if (taskDeadline > projectDeadline) {
        return res.status(400).json({ 
          error: `Rok zadatka ne može biti posle roka projekta (${projectDeadline.toLocaleDateString('sr-RS')})` 
        });
      }
    }

    const updateData = {};
    
    if (isManager) {
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (priority) updateData.priority = priority;
      if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
      if (deadline !== undefined) updateData.deadline = deadline;
      if (status) updateData.status = status;
      if (position !== undefined) updateData.position = position;
      if (list_id) updateData.list_id = list_id;
    } else if (isAssignee) {
      if (description !== undefined) updateData.description = description;
      if (status) updateData.status = status;
    }

    if (status === 'završeno' && task.status !== 'završeno') {
      updateData.completed_at = new Date();
    }

    await task.update(updateData);

    res.json({
      message: 'Zadatak ažuriran.',
      task
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { 
          model: List, 
          as: 'list',
          include: [{ model: Project, as: 'project' }]
        }
      ]
    });

    if (!task) {
      return res.status(404).json({ error: 'Zadatak nije pronađen.' });
    }

    const project = task.list.project;

    if (project.created_by !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'project_manager') {
      return res.status(403).json({ error: 'Nemate dozvolu za brisanje zadataka.' });
    }

    await task.destroy();
    res.json({ message: 'Zadatak obrisan.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};