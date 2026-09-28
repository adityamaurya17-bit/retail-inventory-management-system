import { query } from '../config/db.js';

/**
 * Get all customers with ordering metrics
 * GET /api/customers
 */
export const getCustomers = async (req, res, next) => {
  try {
    const { search = '' } = req.query;

    const conditions = [];
    const params = [];

    if (search.trim()) {
      params.push(`%${search.trim()}%`);
      conditions.push(`(c.name ILIKE $${params.length} OR c.email ILIKE $${params.length} OR c.phone ILIKE $${params.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.address,
        c.created_at,
        COUNT(o.id)::int AS total_orders,
        COALESCE(SUM(o.total_amount), 0)::numeric(12,2) AS lifetime_value,
        MAX(o.created_at) AS last_order_date
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.created_at DESC;
    `;

    const result = await query(sql, params);

    res.status(200).json({
      success: true,
      message: 'Customers retrieved successfully.',
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get customer by ID with full order history
 * GET /api/customers/:id
 */
export const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const custRes = await query(
      `SELECT 
        c.*,
        COUNT(o.id)::int AS total_orders,
        COALESCE(SUM(o.total_amount), 0)::numeric(12,2) AS lifetime_value
       FROM customers c
       LEFT JOIN orders o ON c.id = o.customer_id
       WHERE c.id = $1
       GROUP BY c.id;`,
      [id]
    );

    if (custRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    // Orders placed by this customer
    const ordersRes = await query(
      `SELECT 
        o.id,
        o.status,
        o.total_amount,
        o.created_at,
        w.name AS warehouse_name,
        COUNT(oi.id)::int AS item_count
       FROM orders o
       JOIN warehouses w ON o.warehouse_id = w.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.customer_id = $1
       GROUP BY o.id, w.name
       ORDER BY o.created_at DESC;`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Customer retrieved successfully.',
      data: {
        ...custRes.rows[0],
        orders: ordersRes.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new customer
 * POST /api/customers
 */
export const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;

    const result = await query(
      `INSERT INTO customers (name, email, phone, address)
       VALUES ($1, $2, $3, $4)
       RETURNING *;`,
      [
        name.trim(),
        email.toLowerCase().trim(),
        phone ? phone.trim() : null,
        address ? address.trim() : null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Customer created successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing customer
 * PUT /api/customers/:id
 */
export const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    const result = await query(
      `UPDATE customers
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           address = COALESCE($4, address)
       WHERE id = $5
       RETURNING *;`,
      [
        name ? name.trim() : null,
        email ? email.toLowerCase().trim() : null,
        phone !== undefined ? (phone ? phone.trim() : null) : null,
        address !== undefined ? (address ? address.trim() : null) : null,
        id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
