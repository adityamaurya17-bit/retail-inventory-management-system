import { query } from '../config/db.js';

/**
 * Get all warehouses with aggregated stock metrics
 * GET /api/warehouses
 */
export const getWarehouses = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT 
        w.id,
        w.name,
        w.location,
        w.manager,
        w.created_at,
        COUNT(DISTINCT i.product_id)::int AS total_products,
        COALESCE(SUM(i.quantity), 0)::int AS total_items,
        COALESCE(SUM(i.reserved_quantity), 0)::int AS total_reserved,
        (COALESCE(SUM(i.quantity), 0) - COALESCE(SUM(i.reserved_quantity), 0))::int AS available_items,
        COALESCE(SUM(i.quantity * p.cost_price), 0)::numeric(12,2) AS total_valuation
       FROM warehouses w
       LEFT JOIN inventory i ON w.id = i.warehouse_id
       LEFT JOIN products p ON i.product_id = p.id
       GROUP BY w.id
       ORDER BY w.name ASC;`
    );

    res.status(200).json({
      success: true,
      message: 'Warehouses retrieved successfully.',
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get warehouse by ID with inventory list
 * GET /api/warehouses/:id
 */
export const getWarehouseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const whRes = await query(
      `SELECT 
        w.*,
        COUNT(DISTINCT i.product_id)::int AS total_products,
        COALESCE(SUM(i.quantity), 0)::int AS total_items,
        COALESCE(SUM(i.reserved_quantity), 0)::int AS total_reserved
       FROM warehouses w
       LEFT JOIN inventory i ON w.id = i.warehouse_id
       WHERE w.id = $1
       GROUP BY w.id;`,
      [id]
    );

    if (whRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Warehouse not found.' });
    }

    // Products in this warehouse
    const itemsRes = await query(
      `SELECT 
        p.id AS product_id,
        p.sku,
        p.name,
        c.name AS category_name,
        p.price,
        p.cost_price,
        p.reorder_level,
        i.quantity,
        i.reserved_quantity,
        (i.quantity - i.reserved_quantity) AS available_quantity,
        CASE WHEN i.quantity <= p.reorder_level THEN true ELSE false END AS is_low_stock,
        i.updated_at
       FROM inventory i
       JOIN products p ON i.product_id = p.id
       JOIN categories c ON p.category_id = c.id
       WHERE i.warehouse_id = $1
       ORDER BY p.name ASC;`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Warehouse retrieved successfully.',
      data: {
        ...whRes.rows[0],
        inventory: itemsRes.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new warehouse
 * POST /api/warehouses
 */
export const createWarehouse = async (req, res, next) => {
  try {
    const { name, location, manager } = req.body;

    const result = await query(
      `INSERT INTO warehouses (name, location, manager)
       VALUES ($1, $2, $3)
       RETURNING *;`,
      [name.trim(), location.trim(), manager ? manager.trim() : null]
    );

    res.status(201).json({
      success: true,
      message: 'Warehouse created successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update warehouse details
 * PUT /api/warehouses/:id
 */
export const updateWarehouse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, location, manager } = req.body;

    const result = await query(
      `UPDATE warehouses
       SET name = COALESCE($1, name),
           location = COALESCE($2, location),
           manager = COALESCE($3, manager)
       WHERE id = $4
       RETURNING *;`,
      [
        name ? name.trim() : null,
        location ? location.trim() : null,
        manager !== undefined ? (manager ? manager.trim() : null) : null,
        id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Warehouse not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Warehouse updated successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete warehouse
 * DELETE /api/warehouses/:id
 */
export const deleteWarehouse = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check inventory
    const stockRes = await query(
      `SELECT SUM(quantity)::int AS total_stock FROM inventory WHERE warehouse_id = $1;`,
      [id]
    );
    if (stockRes.rows[0]?.total_stock > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete warehouse holding active inventory (${stockRes.rows[0].total_stock} units). Transfer or clear inventory first.`
      });
    }

    const delRes = await query('DELETE FROM warehouses WHERE id = $1 RETURNING id;', [id]);
    if (delRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Warehouse not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Warehouse deleted successfully.',
      data: { id: parseInt(id, 10) }
    });
  } catch (error) {
    next(error);
  }
};
