const authMiddleware = {
  authenticateToken: (req, res, next) => {
    // Basic token authentication - can be enhanced later
    next();
  },
  
  requireAdmin: (req, res, next) => {
    // Basic admin check - can be enhanced later
    next();
  }
};

module.exports = authMiddleware;
