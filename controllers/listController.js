const { List, Project, ProjectMember } = require('../models');

exports.getListsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Projekat nije pronađen.' });
    }

    const isMember = await ProjectMember.findOne({
      where: { project_id: projectId, user_id: req.user.id }
    });

    if (!isMember && project.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Nemate pristup ovom projektu.' });
    }

    const lists = await List.findAll({
      where: { project_id: projectId },
      order: [['position', 'ASC']]
    });

    res.json(lists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.createList = async (req, res) => {
  try {
    const { project_id, name } = req.body;

    const project = await Project.findByPk(project_id);
    if (!project) {
      return res.status(404).json({ error: 'Projekat nije pronađen.' });
    }

    if (project.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Nemate dozvolu za kreiranje lista.' });
    }

    const maxPosition = await List.max('position', { where: { project_id } }) || 0;

    const list = await List.create({
      project_id,
      name,
      position: maxPosition + 1
    });

    res.status(201).json({
      message: 'Lista kreirana.',
      list
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateList = async (req, res) => {
  try {
    const { name, position } = req.body;
    const list = await List.findByPk(req.params.id, {
      include: [{ model: Project, as: 'project' }]
    });

    if (!list) {
      return res.status(404).json({ error: 'Lista nije pronađena.' });
    }

    if (list.project.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Nemate dozvolu za izmenu ove liste.' });
    }

    await list.update({ name, position });

    res.json({
      message: 'Lista ažurirana.',
      list
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteList = async (req, res) => {
  try {
    const list = await List.findByPk(req.params.id, {
      include: [{ model: Project, as: 'project' }]
    });

    if (!list) {
      return res.status(404).json({ error: 'Lista nije pronađena.' });
    }

    if (list.project.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Nemate dozvolu za brisanje ove liste.' });
    }

    await list.destroy();
    res.json({ message: 'Lista obrisana.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};