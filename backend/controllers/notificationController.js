import { query } from '../config/db.js';

/**
 * Get recent system notifications
 * GET /api/notifications
 */
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;

    const result = await query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 OR user_id IS NULL 
       ORDER BY created_at DESC 
       LIMIT 30;`,
      [userId]
    );

    const unreadCountRes = await query(
      `SELECT COUNT(*)::int AS unread_count 
       FROM notifications 
       WHERE (user_id = $1 OR user_id IS NULL) AND is_read = false;`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved.',
      data: {
        notifications: result.rows,
        unread_count: unreadCountRes.rows[0]?.unread_count || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE id = $1 
       RETURNING *;`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;

    await query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE user_id = $1 OR user_id IS NULL;`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
};
