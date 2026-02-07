const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authValidation = require('../middleware/authValidation');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/Auth');


router.post('/register', authValidation.register, validate, authController.register);
router.post('/login', authValidation.login, validate, authController.login);

router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;
