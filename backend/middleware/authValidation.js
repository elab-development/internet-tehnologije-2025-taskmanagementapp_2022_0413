const { body } = require('express-validator');

const authValidation = {
  register: [
    body('name')
      .trim()
      .notEmpty().withMessage('Ime je obavezno')
      .isLength({ min: 2, max: 100 }).withMessage('Ime mora biti između 2 i 100 karaktera'),
    
    body('email')
      .trim()
      .notEmpty().withMessage('Email je obavezan')
      .isEmail().withMessage('Email mora biti validan')
      .normalizeEmail(),
    
    body('password')
      .notEmpty().withMessage('Lozinka je obavezna')
      .isLength({ min: 8 }).withMessage('Lozinka mora imati minimum 8 karaktera')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Lozinka mora sadržati veliko slovo, malo slovo i broj'),
    
    body('role')
      .optional()
      .isIn(['admin', 'project_manager', 'user']).withMessage('Nevažeća uloga')
  ],

  login: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email je obavezan')
      .isEmail().withMessage('Email mora biti validan')
      .normalizeEmail(),
    
    body('password')
      .notEmpty().withMessage('Lozinka je obavezna')
  ]
};

module.exports = authValidation;