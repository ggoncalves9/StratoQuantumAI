// Authentication middleware for Strato Quantum Platform
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Mock user for development (will be replaced with database)
const mockUser = {
  id: 'user_123',
  name: 'Demo User',
  email: 'demo@stratoquantum.com',
  role: 'admin'
};

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // For development, allow requests without token
    if (process.env.NODE_ENV === 'development' && !token) {
      req.user = mockUser;
      return next();
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
      
      // In production, this would fetch user from database
      req.user = decoded.user || mockUser;
      
      next();
    } catch (error) {
      logger.error('Token verification failed:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

module.exports = auth;