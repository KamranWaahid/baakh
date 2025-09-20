const jwt = require('jsonwebtoken');

const authMiddleware = {
  authenticateToken: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
  },
  
  requireAdmin: (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin' && req.user.role !== 'editor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    next();
  },

  requireEditor: (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Check if user has editor or admin role
    if (req.user.role !== 'admin' && req.user.role !== 'editor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Editor access required' 
      });
    }

    next();
  },

  requireReviewer: (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Check if user has any valid role
    if (!['admin', 'editor', 'reviewer'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Reviewer access required' 
      });
    }

    next();
  }
};

module.exports = authMiddleware;
