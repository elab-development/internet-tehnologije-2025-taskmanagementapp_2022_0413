const { Project, User, ProjectMember, List, Task } = require('../models');

exports.getAllProjects = async (req, res) => {
  try {
    let projects;

    if (req.user.role === 'admin') {
      projects = await Project.findAll({
        include: [
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'members', attributes: ['id', 'name', 'email'], through: { attributes: [] } }
        ]
      });
    } else {
      projects = await Project.findAll({
        include: [
          {
            model: User,
            as: 'members',
            where: { id: req.user.id },
            attributes: ['id', 'name'],
            through: { attributes: [] }
          },
          { model: User, as: 'creator', attributes: ['id', 'name'] }
        ]
      });
    }

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email'], through: { attributes: [] } },
        { model: List, as: 'lists' }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Projekat nije pronađen.' });
    }

    const isMember = project.members.some(member => member.id === req.user.id);
    const isCreator = project.created_by === req.user.id;
    
    if (!isMember && !isCreator && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Nemate pristup ovom projektu.' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { name, description, deadline } = req.body;

    const project = await Project.create({
      name,
      description,
      deadline,
      created_by: req.user.id
    });

    await ProjectMember.create({
      project_id: project.id,
      user_id: req.user.id
    });

    await List.bulkCreate([
      { project_id: project.id, name: 'Planirano', position: 1 },
      { project_id: project.id, name: 'U toku', position: 2 },
      { project_id: project.id, name: 'Završeno', position: 3 }
    ]);

    res.status(201).json({
      message: 'Projekat uspešno kreiran.',
      project
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { name, description, deadline, status } = req.body;
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Projekat nije pronađen.' });
    }

    if (project.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Nemate dozvolu za izmenu ovog projekta.' });
    }

    await project.update({ name, description, deadline, status });

    res.json({
      message: 'Projekat ažuriran.',
      project
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Projekat nije pronađen.' });
    }

    if (project.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Nemate dozvolu za brisanje ovog projekta.' });
    }

    await project.destroy();
    res.json({ message: 'Projekat obrisan.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { user_id } = req.body;
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Projekat nije pronađen.' });
    }

    if (project.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Nemate dozvolu za dodavanje članova.' });
    }

    const existingMember = await ProjectMember.findOne({
      where: { project_id: project.id, user_id }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'Korisnik je već član projekta.' });
    }

    await ProjectMember.create({
      project_id: project.id,
      user_id
    });

    res.status(201).json({ message: 'Član uspešno dodat.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { user_id } = req.body;
    const project = await Project.findByPk(req.params.id, {
      include: [{ model: List, as: 'lists' }]
    });

    if (!project) {
      return res.status(404).json({ error: 'Projekat nije pronađen.' });
    }

    if (project.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Nemate dozvolu za uklanjanje članova.' });
    }

    const member = await ProjectMember.findOne({
      where: { project_id: project.id, user_id }
    });

    if (!member) {
      return res.status(404).json({ error: 'Član nije pronađen.' });
    }

    const listIds = project.lists.map(list => list.id);
    
    await Task.update(
      { assigned_to: req.user.id },
      { 
        where: { 
          list_id: listIds,
          assigned_to: user_id,
          status: ['planirano', 'u toku']
        } 
      }
    );

    await member.destroy();
    res.json({ message: 'Član uklonjen.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};