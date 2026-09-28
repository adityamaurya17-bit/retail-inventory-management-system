import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token missing.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_rims_capstone_2026_secure');
    
    // Fetch fresh user and role information from the database
    const userResult = await query(
      `SELECT u.id, u.name, u.email, u.role_id, r.name AS role 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = $1`,
      [decoded.id]
    );

    if (userResult.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User no longer exists.'
      });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.',
      error: error.message
    });
  }
};

/**
 * Role-Based Access Control (RBAC) authorization middleware
 * @param  {...string} allowedRoles Allowed role names (e.g. 'Admin', 'Inventory Manager')
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User credentials not verified.'
      });
    }

    // Admin role has unrestricted access across the entire system
    if (req.user.role === 'Admin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' lacks permission to access this resource. Required roles: ${allowedRoles.join(', ')}.`
      });
    }

    next();
  };
};
