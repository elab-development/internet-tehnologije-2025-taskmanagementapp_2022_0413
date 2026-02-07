const { body, param } = require('express-validator');

const projectValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Naziv projekta je obavezan')
      .isLength({ min: 3, max: 200 })
      .withMessage('Naziv mora imati između 3 i 200 karaktera'),

    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Opis ne može biti duži od 5000 karaktera'),

    body('deadline')
      .optional()
      .isISO8601()
      .withMessage('Nevažeći format datuma')
      .custom((value) => {
        if (!value) return true;

        const inputDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (inputDate < today) {
          throw new Error('Rok projekta ne može biti u prošlosti');
        }

        return true;
      })
  ],

  update: [
    param('id')
      .isInt().withMessage('ID projekta mora biti broj'),

    body('name')
      .optional()
      .trim()
      .notEmpty()
      .isLength({ min: 3, max: 200 }),

    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 }),

    body('deadline')
      .optional()
      .isISO8601()
      .withMessage('Nevažeći format datuma')
      .custom((value) => {
        if (!value) return true;

        const inputDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (inputDate < today) {
          throw new Error('Rok projekta ne može biti u prošlosti');
        }

        return true;
      })
  ]
};

module.exports = projectValidation;
