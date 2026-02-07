const { body, param, query } = require('express-validator');

const taskValidation = {
  create: [
    body('list_id')
      .notEmpty().withMessage('ID liste je obavezan')
      .isInt().withMessage('ID liste mora biti broj'),
    
    body('title')
      .trim()
      .notEmpty().withMessage('Naziv zadatka je obavezan')
      .isLength({ min: 3, max: 200 }).withMessage('Naziv mora biti između 3 i 200 karaktera'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 }).withMessage('Opis ne može biti duži od 5000 karaktera'),
    
    body('priority')
      .optional()
      .isIn(['visok', 'srednji', 'nizak']).withMessage('Nevažeći prioritet'),
    
    body('assigned_to')
      .optional()
      .isInt().withMessage('ID korisnika mora biti broj'),
    
    body('deadline')
      .optional()
      .isISO8601().withMessage('Nevažeći format datuma')
      .custom((value) => {
        if (!value) return true;
        const inputDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (inputDate < today) {
          throw new Error('Rok ne može biti u prošlosti');
        }
        return true;
      })
  ],

  update: [
    param('id')
      .isInt().withMessage('ID zadatka mora biti broj'),
    
    body('title')
      .optional()
      .trim()
      .notEmpty().withMessage('Naziv zadatka ne može biti prazan')
      .isLength({ min: 3, max: 200 }).withMessage('Naziv mora biti između 3 i 200 karaktera'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 }).withMessage('Opis ne može biti duži od 5000 karaktera'),
    
    body('priority')
      .optional()
      .isIn(['visok', 'srednji', 'nizak']).withMessage('Nevažeći prioritet'),
    
    body('status')
      .optional()
      .isIn(['planirano', 'u toku', 'završeno']).withMessage('Nevažeći status'),
    
    body('assigned_to')
      .optional()
      .isInt().withMessage('ID korisnika mora biti broj'),
    
    body('deadline')
      .optional()
      .isISO8601().withMessage('Nevažeći format datuma')
      .custom((value) => {
        if (!value) return true;
        const inputDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (inputDate < today) {
          throw new Error('Rok ne može biti u prošlosti');
        }
        return true;
      }),
    
    body('position')
      .optional()
      .isInt({ min: 0 }).withMessage('Pozicija mora biti pozitivan broj'),
    
    body('list_id')
      .optional()
      .isInt().withMessage('ID liste mora biti broj')
  ],

  search: [
    query('search')
      .optional()
      .trim()
      .isLength({ max: 200 }).withMessage('Pretraga ne može biti duža od 200 karaktera'),
    
    query('priority')
      .optional()
      .isIn(['visok', 'srednji', 'nizak']).withMessage('Nevažeći prioritet'),
    
    query('status')
      .optional()
      .isIn(['planirano', 'u toku', 'završeno']).withMessage('Nevažeći status'),
    
    query('assigned_to')
      .optional()
      .isInt().withMessage('ID korisnika mora biti broj')
  ]
};

module.exports = taskValidation;