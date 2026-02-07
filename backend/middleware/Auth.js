const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Pristup odbijen. Token nije pronađen.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Korisnik nije pronađen.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Nevažeći token.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Neautorizovan pristup.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Nemate dozvolu za ovu akciju.',
        requiredRole: roles,
        yourRole: req.user.role
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
