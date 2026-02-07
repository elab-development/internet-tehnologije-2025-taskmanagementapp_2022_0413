const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/Auth');
const taskValidation = require('../middleware/taskValidation');
const validate = require('../middleware/validate');

router.get('/', authenticate, taskController.getAllTasks);
router.get('/list/:listId', authenticate, taskController.getTasksByList);
router.get('/:id', authenticate, taskController.getTaskById);

router.post(
  '/',
  authenticate,
  taskValidation.create,
  validate,
  taskController.createTask
);

router.put(
  '/:id',
  authenticate,
  taskValidation.update,
  validate,
  taskController.updateTask
);

router.delete('/:id', authenticate, taskController.deleteTask);

module.exports = router;
