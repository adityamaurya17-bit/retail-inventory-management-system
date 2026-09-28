import { query, getClient } from '../config/db.js';

/**
 * Get all sales orders with customer and warehouse details
 * GET /api/orders
 */
export const getOrders = async (req, res, next) => {
  try {
    const { status, warehouse_id, customer_id, search = '' } = req.query;

    const conditions = [];
    const params = [];

    if (status) {
      params.push(status.toUpperCase());
      conditions.push(`o.status = $${params.length}`);
    }

    if (warehouse_id) {
      params.push(parseInt(warehouse_id, 10));
      conditions.push(`o.warehouse_id = $${params.length}`);
    }

    if (customer_id) {
      params.push(parseInt(customer_id, 10));
      conditions.push(`o.customer_id = $${params.length}`);
    }

    if (search.trim()) {
      params.push(`%${search.trim()}%`);
      conditions.push(`(c.name ILIKE $${params.length} OR o.id::text ILIKE $${params.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        o.id,
        o.status,
        o.total_amount,
        o.created_at,
        o.updated_at,
        c.id AS customer_id,
        c.name AS customer_name,
        c.email AS customer_email,
        w.id AS warehouse_id,
        w.name AS warehouse_name,
        COUNT(oi.id)::int AS items_count,
        COALESCE(SUM(oi.quantity), 0)::int AS total_units
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN warehouses w ON o.warehouse_id = w.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id, c.id, w.id
      ORDER BY o.created_at DESC;
    `;

    const result = await query(sql, params);

    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully.',
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get sales order by ID with line items
 * GET /api/orders/:id
 */
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const orderRes = await query(
      `SELECT 
        o.*,
        c.name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,
        c.address AS customer_address,
        w.name AS warehouse_name,
        w.location AS warehouse_location,
        u.name AS created_by_name
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       JOIN warehouses w ON o.warehouse_id = w.id
       LEFT JOIN users u ON o.created_by = u.id
       WHERE o.id = $1;`,
      [id]
    );

    if (orderRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Line items
    const itemsRes = await query(
      `SELECT 
        oi.id,
        oi.product_id,
        p.sku,
        p.name AS product_name,
        oi.quantity,
        oi.unit_price,
        oi.subtotal
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1
       ORDER BY oi.id ASC;`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Order retrieved successfully.',
      data: {
        ...orderRes.rows[0],
        items: itemsRes.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new Sales Order with Atomic Stock Reservation (ACID)
 * POST /api/orders
 */
export const createOrder = async (req, res, next) => {
  const client = await getClient();
  try {
    const { customer_id, warehouse_id, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one line item.'
      });
    }

    await client.query('BEGIN');

    // Calculate total and validate stock availability with row lock
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const pid = parseInt(item.product_id, 10);
      const reqQty = parseInt(item.quantity, 10);

      if (reqQty <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Invalid quantity ${reqQty} for product ID ${pid}. Must be greater than zero.`
        });
      }

      // Check product details and price
      const prodRes = await client.query('SELECT name, sku, price FROM products WHERE id = $1;', [pid]);
      if (prodRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: `Product with ID ${pid} does not exist.`
        });
      }

      const prod = prodRes.rows[0];
      const unitPrice = item.unit_price !== undefined ? parseFloat(item.unit_price) : parseFloat(prod.price);
      const subtotal = unitPrice * reqQty;
      totalAmount += subtotal;

      // Lock inventory row
      const invRes = await client.query(
        `SELECT quantity, reserved_quantity 
         FROM inventory 
         WHERE product_id = $1 AND warehouse_id = $2 
         FOR UPDATE;`,
        [pid, warehouse_id]
      );

      if (invRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `No inventory record for product '${prod.name}' (${prod.sku}) at the selected warehouse.`
        });
      }

      const inv = invRes.rows[0];
      const availableStock = inv.quantity - inv.reserved_quantity;

      if (availableStock < reqQty) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Insufficient available stock for '${prod.name}' (${prod.sku}). Available: ${availableStock}, Requested: ${reqQty}.`
        });
      }

      validatedItems.push({
        product_id: pid,
        name: prod.name,
        quantity: reqQty,
        unit_price: unitPrice,
        subtotal
      });
    }

    // 1. Insert Order (initial state RESERVED)
    const orderInsertRes = await client.query(
      `INSERT INTO orders (customer_id, warehouse_id, status, total_amount, created_by)
       VALUES ($1, $2, 'RESERVED', $3, $4)
       RETURNING *;`,
      [customer_id, warehouse_id, totalAmount.toFixed(2), req.user ? req.user.id : null]
    );

    const newOrder = orderInsertRes.rows[0];

    // 2. Insert Order Items & Reserve Inventory
    for (const vItem of validatedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5);`,
        [newOrder.id, vItem.product_id, vItem.quantity, vItem.unit_price, vItem.subtotal]
      );

      // Reserve stock
      await client.query(
        `UPDATE inventory
         SET reserved_quantity = reserved_quantity + $1, updated_at = CURRENT_TIMESTAMP
         WHERE product_id = $2 AND warehouse_id = $3;`,
        [vItem.quantity, vItem.product_id, warehouse_id]
      );
    }

    // 3. System Notification
    await client.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'ORDER_CREATED', 'New Sales Order Created', $2);`,
      [
        req.user ? req.user.id : null,
        `Sales Order #${newOrder.id} placed for $${totalAmount.toFixed(2)}. Inventory reserved successfully.`
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Sales Order placed and inventory reserved successfully.',
      data: {
        ...newOrder,
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
 * Transition Order Fulfillment Status (Stage-Gate Workflow)
 * PUT /api/orders/:id/status
 */
export const updateOrderStatus = async (req, res, next) => {
  const client = await getClient();
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['RESERVED', 'PICKED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    await client.query('BEGIN');

    // Lock order
    const orderRes = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE;', [id]);
    if (orderRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orderRes.rows[0];

    // Disallow transitions from CANCELLED or DELIVERED
    if (order.status === 'CANCELLED') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Cannot update status of a cancelled order.'
      });
    }

    if (order.status === 'DELIVERED') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Order is already marked as DELIVERED.'
      });
    }

    // Get order items
    const itemsRes = await client.query('SELECT * FROM order_items WHERE order_id = $1;', [id]);
    const items = itemsRes.rows;

    // HANDLING: Transitioning to SHIPPED (Physically deduct stock and release reserved quantity)
    if (status === 'SHIPPED' && order.status !== 'SHIPPED') {
      for (const item of items) {
        // Deduct physical inventory & clear reservation
        await client.query(
          `UPDATE inventory
           SET quantity = quantity - $1,
               reserved_quantity = reserved_quantity - $1,
               updated_at = CURRENT_TIMESTAMP
           WHERE product_id = $2 AND warehouse_id = $3;`,
          [item.quantity, item.product_id, order.warehouse_id]
        );

        // Record SALE stock movement
        await client.query(
          `INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, reference_id, notes, performed_by)
           VALUES ($1, $2, 'SALE', $3, $4, $5, $6);`,
          [
            item.product_id,
            order.warehouse_id,
            item.quantity,
            `SO-${order.id}`,
            `Order #${order.id} shipped to customer`,
            req.user ? req.user.id : null
          ]
        );
      }
    }

    // HANDLING: Transitioning to CANCELLED (Release reserved stock if not already shipped)
    if (status === 'CANCELLED') {
      if (['RESERVED', 'PICKED', 'PACKED', 'CREATED'].includes(order.status)) {
        for (const item of items) {
          await client.query(
            `UPDATE inventory
             SET reserved_quantity = GREATEST(0, reserved_quantity - $1),
                 updated_at = CURRENT_TIMESTAMP
             WHERE product_id = $2 AND warehouse_id = $3;`,
            [item.quantity, item.product_id, order.warehouse_id]
          );
        }
      } else if (order.status === 'SHIPPED') {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Cannot directly cancel a shipped order. Please process a customer return instead.'
        });
      }
    }

    // Update status
    const updateRes = await client.query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *;`,
      [status, id]
    );

    // Notification
    await client.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'ORDER_STATUS', 'Order Status Updated', $2);`,
      [
        req.user ? req.user.id : null,
        `Order #${id} status changed from ${order.status} to ${status}.`
      ]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}.`,
      data: updateRes.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};
