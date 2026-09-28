import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role_id = 3 } = req.body;

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = $1;', [email.toLowerCase().trim()]);
    if (existing.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    // Verify role exists
    const roleCheck = await query('SELECT id, name FROM roles WHERE id = $1;', [role_id]);
    if (roleCheck.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role_id specified.'
      });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const insertRes = await query(
      `INSERT INTO users (name, email, password_hash, role_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role_id, created_at;`,
      [name.trim(), email.toLowerCase().trim(), passwordHash, role_id]
    );

    const newUser = insertRes.rows[0];
    const roleName = roleCheck.rows[0].name;

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: roleName },
      process.env.JWT_SECRET || 'super_secret_jwt_key_rims_capstone_2026_secure',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role_id: newUser.role_id,
          role: roleName,
          created_at: newUser.created_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with role
    const userRes = await query(
      `SELECT u.id, u.name, u.email, u.password_hash, u.role_id, r.name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1;`,
      [email.toLowerCase().trim()]
    );

    if (userRes.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = userRes.rows[0];

    // Verify password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'super_secret_jwt_key_rims_capstone_2026_secure',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'User profile retrieved.',
    data: {
      user: req.user
    }
  });
};
