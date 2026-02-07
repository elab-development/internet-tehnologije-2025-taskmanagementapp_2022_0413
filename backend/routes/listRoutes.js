const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');
const { authenticate, authorize } = require('../middleware/Auth'); 

router.use(authenticate);

router.get('/project/:projectId', listController.getListsByProject);

router.post('/', authorize('project_manager', 'admin'), listController.createList);

router.put('/:id', authorize('project_manager', 'admin'), listController.updateList);

router.delete('/:id', authorize('project_manager', 'admin'), listController.deleteList);

module.exports = router;
