import jwt from 'jsonwebtoken';
import { db } from '../services/dbService.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'placementpilot_super_secret_token_12345');
      
      const user = await db.users.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found, authentication failed' });
      }
      
      req.user = user;
      next();
    } catch (error) {
      console.error("JWT verification error", error);
      res.status(401).json({ message: 'Not authorized, token validation failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, token missing' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, administrator privileges required' });
  }
};
