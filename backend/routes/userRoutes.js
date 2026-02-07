const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/Auth');

router.use(authenticate);

router.get('/', userController.getAllUsers);

router.get('/:id', userController.getUserById);

router.post('/', authorize('admin'), userController.createUser);
router.put('/:id', authenticate, userController.updateUser);

router.delete('/:id', authenticate, userController.deleteUser);

module.exports = router;