import { query, getClient } from '../config/db.js';

/**
 * Get current inventory records with full product and warehouse details
 * GET /api/inventory
 */
export const getInventory = async (req, res, next) => {
  try {
    const {
      warehouse_id,
      product_id,
      category_id,
      low_stock_only,
      search = ''
    } = req.query;

    const conditions = [];
    const params = [];

    if (warehouse_id) {
      params.push(parseInt(warehouse_id, 10));
      conditions.push(`i.warehouse_id = $${params.length}`);
    }

    if (product_id) {
      params.push(parseInt(product_id, 10));
      conditions.push(`i.product_id = $${params.length}`);
    }

    if (category_id) {
      params.push(parseInt(category_id, 10));
      conditions.push(`p.category_id = $${params.length}`);
    }

    if (search.trim()) {
      params.push(`%${search.trim()}%`);
      conditions.push(`(p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length} OR w.name ILIKE $${params.length})`);
    }

    if (low_stock_only === 'true') {
      conditions.push(`i.quantity <= p.reorder_level`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        i.id,
        i.product_id,
        p.sku,
        p.name AS product_name,
        c.name AS category_name,
        p.price,
        p.cost_price,
        p.reorder_level,
        i.warehouse_id,
        w.name AS warehouse_name,
        w.location AS warehouse_location,
        i.quantity,
        i.reserved_quantity,
        (i.quantity - i.reserved_quantity) AS available_quantity,
        (i.quantity * p.cost_price)::numeric(12,2) AS valuation,
        CASE WHEN i.quantity <= p.reorder_level THEN true ELSE false END AS is_low_stock,
        i.updated_at
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN warehouses w ON i.warehouse_id = w.id
      ${whereClause}
      ORDER BY is_low_stock DESC, p.name ASC, w.name ASC;
    `;

    const result = await query(sql, params);

    res.status(200).json({
      success: true,
      message: 'Inventory records retrieved successfully.',
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get low-stock items with intelligent reorder suggestions
 * GET /api/inventory/low-stock
 */
export const getLowStockAlerts = async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        i.id AS inventory_id,
        p.id AS product_id,
        p.sku,
        p.name AS product_name,
        c.name AS category_name,
        w.id AS warehouse_id,
        w.name AS warehouse_name,
        i.quantity AS current_stock,
        i.reserved_quantity,
        (i.quantity - i.reserved_quantity) AS available_stock,
        p.reorder_level,
        GREATEST((p.reorder_level * 2) - i.quantity, 10) AS suggested_reorder_qty,
        p.cost_price,
        (GREATEST((p.reorder_level * 2) - i.quantity, 10) * p.cost_price)::numeric(12,2) AS estimated_reorder_cost,
        i.updated_at
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN warehouses w ON i.warehouse_id = w.id
      WHERE i.quantity <= p.reorder_level
      ORDER BY (p.reorder_level - i.quantity) DESC;
    `;

    const result = await query(sql);

    res.status(200).json({
      success: true,
      message: 'Low stock alerts retrieved.',
      count: result.rowCount,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Execute Stock Adjustment with ACID Transaction & Audit Logging
 * POST /api/inventory/adjust
 */
export const adjustStock = async (req, res, next) => {
  const client = await getClient();
  try {
    const {
      product_id,
      warehouse_id,
      adjustment_type, // 'ADD', 'SUBTRACT', 'SET'
      quantity,
      notes = ''
    } = req.body;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({
        success: false,
        message: 'Adjustment quantity must be a non-negative integer.'
      });
    }

    await client.query('BEGIN');

    // Lock existing inventory row or create one
    let invRes = await client.query(
      `SELECT * FROM inventory WHERE product_id = $1 AND warehouse_id = $2 FOR UPDATE;`,
      [product_id, warehouse_id]
    );

    let currentQty = 0;
    let currentReserved = 0;

    if (invRes.rowCount === 0) {
      // Create record
      const initRes = await client.query(
        `INSERT INTO inventory (product_id, warehouse_id, quantity, reserved_quantity)
         VALUES ($1, $2, 0, 0)
         RETURNING *;`,
        [product_id, warehouse_id]
      );
      currentQty = 0;
      currentReserved = 0;
    } else {
      currentQty = invRes.rows[0].quantity;
      currentReserved = invRes.rows[0].reserved_quantity;
    }

    let newQuantity = currentQty;
    let movementQty = 0;

    if (adjustment_type === 'ADD') {
      newQuantity = currentQty + qty;
      movementQty = qty;
    } else if (adjustment_type === 'SUBTRACT') {
      if (currentQty - qty < currentReserved) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Cannot reduce stock below reserved quantity. Current Stock: ${currentQty}, Reserved: ${currentReserved}, Requested Reduction: ${qty}.`
        });
      }
      newQuantity = currentQty - qty;
      movementQty = qty;
    } else if (adjustment_type === 'SET') {
      if (qty < currentReserved) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Target stock quantity (${qty}) cannot be less than currently reserved quantity (${currentReserved}).`
        });
      }
      movementQty = Math.abs(qty - currentQty);
      newQuantity = qty;
    } else {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: "Invalid adjustment_type. Must be 'ADD', 'SUBTRACT', or 'SET'."
      });
    }

    // Update inventory
    const updateRes = await client.query(
      `UPDATE inventory
       SET quantity = $1, updated_at = CURRENT_TIMESTAMP
       WHERE product_id = $2 AND warehouse_id = $3
       RETURNING *;`,
      [newQuantity, product_id, warehouse_id]
    );

    // Audit log in stock_movements
    if (movementQty > 0) {
      await client.query(
        `INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, reference_id, notes, performed_by)
         VALUES ($1, $2, 'ADJUSTMENT', $3, $4, $5, $6);`,
        [
          product_id,
          warehouse_id,
          movementQty,
          `ADJ-${Date.now()}`,
          notes || `Manual stock adjustment (${adjustment_type} by ${qty})`,
          req.user ? req.user.id : null
        ]
      );
    }

    // Check if item reached low stock
    const prodRes = await client.query('SELECT name, reorder_level FROM products WHERE id = $1;', [product_id]);
    if (prodRes.rowCount > 0 && newQuantity <= prodRes.rows[0].reorder_level) {
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message)
         VALUES ($1, 'LOW_STOCK', 'Low Stock Warning', $2);`,
        [
          req.user ? req.user.id : null,
          `Stock for '${prodRes.rows[0].name}' at warehouse is now at ${newQuantity} units (Reorder Level: ${prodRes.rows[0].reorder_level}).`
        ]
      );
    }

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Stock adjusted successfully.',
      data: updateRes.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

/**
 * Execute Atomic Stock Transfer Between Warehouses
 * POST /api/inventory/transfer
 */
export const transferStock = async (req, res, next) => {
  const client = await getClient();
  try {
    const {
      product_id,
      from_warehouse_id,
      to_warehouse_id,
      quantity,
      notes = ''
    } = req.body;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Transfer quantity must be greater than zero.'
      });
    }

    if (parseInt(from_warehouse_id, 10) === parseInt(to_warehouse_id, 10)) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination warehouses cannot be the same.'
      });
    }

    await client.query('BEGIN');

    // 1. Lock origin inventory row
    const sourceRes = await client.query(
      `SELECT * FROM inventory 
       WHERE product_id = $1 AND warehouse_id = $2 
       FOR UPDATE;`,
      [product_id, from_warehouse_id]
    );

    if (sourceRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Origin warehouse holds no inventory record for this product.'
      });
    }

    const sourceInv = sourceRes.rows[0];
    const availableStock = sourceInv.quantity - sourceInv.reserved_quantity;

    if (availableStock < qty) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Insufficient available stock for transfer. Available: ${availableStock} units, Requested: ${qty} units.`
      });
    }

    // 2. Deduct from origin warehouse
    await client.query(
      `UPDATE inventory
       SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP
       WHERE product_id = $2 AND warehouse_id = $3;`,
      [qty, product_id, from_warehouse_id]
    );

    // 3. Increment or insert into destination warehouse
    await client.query(
      `INSERT INTO inventory (product_id, warehouse_id, quantity, reserved_quantity, updated_at)
       VALUES ($1, $2, $3, 0, CURRENT_TIMESTAMP)
       ON CONFLICT (product_id, warehouse_id)
       DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity, updated_at = CURRENT_TIMESTAMP;`,
      [product_id, to_warehouse_id, qty]
    );

    // 4. Audit ledger records
    const transferRef = `TRF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Origin movement (TRANSFER_OUT)
    await client.query(
      `INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, reference_id, notes, performed_by)
       VALUES ($1, $2, 'TRANSFER_OUT', $3, $4, $5, $6);`,
      [
        product_id,
        from_warehouse_id,
        qty,
        transferRef,
        notes ? `Transfer out to Warehouse #${to_warehouse_id}: ${notes}` : `Transfer out to Warehouse #${to_warehouse_id}`,
        req.user ? req.user.id : null
      ]
    );

    // Destination movement (TRANSFER_IN)
    await client.query(
      `INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, reference_id, notes, performed_by)
       VALUES ($1, $2, 'TRANSFER_IN', $3, $4, $5, $6);`,
      [
        product_id,
        to_warehouse_id,
        qty,
        transferRef,
        notes ? `Transfer in from Warehouse #${from_warehouse_id}: ${notes}` : `Transfer in from Warehouse #${from_warehouse_id}`,
        req.user ? req.user.id : null
      ]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Stock transfer completed successfully.',
      data: {
        transfer_reference: transferRef,
        product_id,
        from_warehouse_id,
        to_warehouse_id,
        transferred_quantity: qty
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

/**
 * Get Stock Movements Audit Log
 * GET /api/inventory/movements
 */
export const getStockMovements = async (req, res, next) => {
  try {
    const {
      product_id,
      warehouse_id,
      movement_type,
      limit = 50
    } = req.query;

    const conditions = [];
    const params = [];

    if (product_id) {
      params.push(parseInt(product_id, 10));
      conditions.push(`sm.product_id = $${params.length}`);
    }

    if (warehouse_id) {
      params.push(parseInt(warehouse_id, 10));
      conditions.push(`sm.warehouse_id = $${params.length}`);
    }

    if (movement_type) {
      params.push(movement_type.toUpperCase());
      conditions.push(`sm.movement_type = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        sm.id,
        sm.product_id,
        p.sku,
        p.name AS product_name,
        sm.warehouse_id,
        w.name AS warehouse_name,
        sm.movement_type,
        sm.quantity,
        sm.reference_id,
        sm.notes,
        u.name AS performed_by_user,
        sm.created_at
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      JOIN warehouses w ON sm.warehouse_id = w.id
      LEFT JOIN users u ON sm.performed_by = u.id
      ${whereClause}
      ORDER BY sm.created_at DESC
      LIMIT $${params.length + 1};
    `;

    params.push(parseInt(limit, 10));
    const result = await query(sql, params);

    res.status(200).json({
      success: true,
      message: 'Stock movements retrieved.',
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};
