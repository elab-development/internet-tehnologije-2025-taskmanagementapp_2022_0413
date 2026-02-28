const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate, authorize } = require('../middleware/Auth');
const projectValidation = require('../middleware/projectValidation');
const validate = require('../middleware/validate');

router.use(authenticate);

router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);

router.post(
  '/',
  authorize('project_manager', 'admin'),
  projectValidation.create,
  validate,
  projectController.createProject
);

router.put(
  '/:id',
  authorize('project_manager', 'admin'),
  projectValidation.update,
  validate,
  projectController.updateProject
);

router.delete(
  '/:id',
  authorize('project_manager', 'admin'),
  projectController.deleteProject
);

router.post(
  '/:id/members',
  authorize('project_manager', 'admin'),
  projectController.addMember
);

router.delete(
  '/:id/members',
  authorize('project_manager', 'admin'),
  projectController.removeMember
);

module.exports = router;