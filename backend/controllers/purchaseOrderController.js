import { query, getClient } from '../config/db.js';

/**
 * Get all Purchase Orders with supplier and warehouse details
 * GET /api/purchase-orders
 */
export const getPurchaseOrders = async (req, res, next) => {
  try {
    const { status, supplier_id, warehouse_id } = req.query;

    const conditions = [];
    const params = [];

    if (status) {
      params.push(status.toUpperCase());
      conditions.push(`po.status = $${params.length}`);
    }

    if (supplier_id) {
      params.push(parseInt(supplier_id, 10));
      conditions.push(`po.supplier_id = $${params.length}`);
    }

    if (warehouse_id) {
      params.push(parseInt(warehouse_id, 10));
      conditions.push(`po.warehouse_id = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        po.id,
        po.status,
        po.total_amount,
        po.expected_date,
        po.created_at,
        po.updated_at,
        s.id AS supplier_id,
        s.name AS supplier_name,
        w.id AS warehouse_id,
        w.name AS warehouse_name,
        COUNT(poi.id)::int AS items_count,
        COALESCE(SUM(poi.quantity), 0)::int AS total_units
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.id
      JOIN warehouses w ON po.warehouse_id = w.id
      LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
      ${whereClause}
      GROUP BY po.id, s.id, w.id
      ORDER BY po.created_at DESC;
    `;

    const result = await query(sql, params);

    res.status(200).json({
      success: true,
      message: 'Purchase orders retrieved successfully.',
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Purchase Order by ID with items
 * GET /api/purchase-orders/:id
 */
export const getPurchaseOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const poRes = await query(
      `SELECT 
        po.*,
        s.name AS supplier_name,
        s.email AS supplier_email,
        s.phone AS supplier_phone,
        w.name AS warehouse_name,
        w.location AS warehouse_location,
        u.name AS created_by_name
       FROM purchase_orders po
       JOIN suppliers s ON po.supplier_id = s.id
       JOIN warehouses w ON po.warehouse_id = w.id
       LEFT JOIN users u ON po.created_by = u.id
       WHERE po.id = $1;`,
      [id]
    );

    if (poRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Purchase order not found.' });
    }

    // Items
    const itemsRes = await query(
      `SELECT 
        poi.id,
        poi.product_id,
        p.sku,
        p.name AS product_name,
        poi.quantity,
        poi.unit_cost,
        poi.subtotal
       FROM purchase_order_items poi
       JOIN products p ON poi.product_id = p.id
       WHERE poi.purchase_order_id = $1
       ORDER BY poi.id ASC;`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Purchase order retrieved successfully.',
      data: {
        ...poRes.rows[0],
        items: itemsRes.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new Purchase Order
 * POST /api/purchase-orders
 */
export const createPurchaseOrder = async (req, res, next) => {
  const client = await getClient();
  try {
    const { supplier_id, warehouse_id, expected_date, items, status = 'ORDERED' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Purchase order must contain at least one line item.'
      });
    }

    await client.query('BEGIN');

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const pid = parseInt(item.product_id, 10);
      const qty = parseInt(item.quantity, 10);
      const unitCost = parseFloat(item.unit_cost);

      if (qty <= 0 || isNaN(unitCost) || unitCost < 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Each item must have a positive quantity and valid unit cost.'
        });
      }

      const subtotal = qty * unitCost;
      totalAmount += subtotal;

      validatedItems.push({
        product_id: pid,
        quantity: qty,
        unit_cost: unitCost,
        subtotal
      });
    }

    // Insert PO
    const poInsertRes = await client.query(
      `INSERT INTO purchase_orders (supplier_id, warehouse_id, status, total_amount, expected_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *;`,
      [
        supplier_id,
        warehouse_id,
        status,
        totalAmount.toFixed(2),
        expected_date || null,
        req.user ? req.user.id : null
      ]
    );

    const newPO = poInsertRes.rows[0];

    // Insert PO items
    for (const vItem of validatedItems) {
      await client.query(
        `INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_cost, subtotal)
         VALUES ($1, $2, $3, $4, $5);`,
        [newPO.id, vItem.product_id, vItem.quantity, vItem.unit_cost, vItem.subtotal]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully.',
      data: {
        ...newPO,
        items: validatedItems
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
 * Receive Goods against Purchase Order (GRN) with ACID Inventory Ingestion
 * PUT /api/purchase-orders/:id/receive
 */
export const receivePurchaseOrder = async (req, res, next) => {
  const client = await getClient();
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Lock PO
    const poRes = await client.query('SELECT * FROM purchase_orders WHERE id = $1 FOR UPDATE;', [id]);
    if (poRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Purchase order not found.' });
    }

    const po = poRes.rows[0];

    if (po.status === 'RECEIVED') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'This purchase order has already been received into inventory.'
      });
    }

    if (po.status === 'CANCELLED') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Cannot receive goods for a cancelled purchase order.'
      });
    }

    // Get PO items
    const itemsRes = await client.query('SELECT * FROM purchase_order_items WHERE purchase_order_id = $1;', [id]);
    const items = itemsRes.rows;

    for (const item of items) {
      // 1. Ingest stock into destination warehouse
      await client.query(
        `INSERT INTO inventory (product_id, warehouse_id, quantity, reserved_quantity, updated_at)
         VALUES ($1, $2, $3, 0, CURRENT_TIMESTAMP)
         ON CONFLICT (product_id, warehouse_id)
         DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity, updated_at = CURRENT_TIMESTAMP;`,
        [item.product_id, po.warehouse_id, item.quantity]
      );

      // 2. Log PURCHASE movement in stock_movements
      await client.query(
        `INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, reference_id, notes, performed_by)
         VALUES ($1, $2, 'PURCHASE', $3, $4, $5, $6);`,
        [
          item.product_id,
          po.warehouse_id,
          item.quantity,
          `PO-${po.id}`,
          `Goods received from PO #${po.id}`,
          req.user ? req.user.id : null
        ]
      );
    }

    // 3. Mark PO as RECEIVED
    const updateRes = await client.query(
      `UPDATE purchase_orders
       SET status = 'RECEIVED', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *;`,
      [id]
    );

    // 4. Notification
    await client.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'PO_RECEIVED', 'Goods Received from PO', $2);`,
      [
        req.user ? req.user.id : null,
        `Goods for Purchase Order #${id} successfully received and stocked into warehouse.`
      ]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Goods received successfully and inventory balances updated.',
      data: updateRes.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};
