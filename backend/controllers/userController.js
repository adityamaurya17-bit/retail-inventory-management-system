import { query } from '../config/db.js';

/**
 * Get all users with roles (Admin only)
 * GET /api/users
 */
export const getUsers = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.role_id, r.name AS role, u.created_at
       FROM users u
       JOIN roles r ON u.role_id = r.id
       ORDER BY u.id ASC;`
    );

    res.status(200).json({
      success: true,
      message: 'Users retrieved.',
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all roles
 * GET /api/users/roles
 */
export const getRoles = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM roles ORDER BY id ASC;');
    res.status(200).json({
      success: true,
      message: 'Roles retrieved.',
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};
