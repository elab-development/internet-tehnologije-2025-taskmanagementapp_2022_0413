const { Comment, Task, User, List, Project, ProjectMember } = require('../models');

exports.getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const comments = await Comment.findAll({
      where: { task_id: taskId },
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'email'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { task_id, content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Komentar ne može biti prazan.' });
    }

    const task = await Task.findByPk(task_id, {
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

    if (!isMember && project.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Nemate pristup ovom zadatku.' });
    }

    const comment = await Comment.create({
      task_id,
      user_id: req.user.id,
      content
    });

    const commentWithAuthor = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }]
    });

    res.status(201).json({
      message: 'Komentar dodat.',
      comment: commentWithAuthor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Komentar ne može biti prazan.' });
    }

    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Komentar nije pronađen.' });
    }

    if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Možete uređivati samo sopstvene komentare.' });
    }

    await comment.update({ content });

    const updatedComment = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }]
    });

    res.json({
      message: 'Komentar ažuriran.',
      comment: updatedComment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Komentar nije pronađen.' });
    }

    if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Možete brisati samo sopstvene komentare.' });
    }

    await comment.destroy();
    res.json({ message: 'Komentar obrisan.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};