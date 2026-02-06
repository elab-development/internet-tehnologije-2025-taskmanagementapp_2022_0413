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

module.exports = authorize;