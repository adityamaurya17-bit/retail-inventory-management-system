import { query } from '../config/db.js';

/**
 * Get comprehensive real-time dashboard analytics & executive KPIs
 * GET /api/reports/dashboard
 */
export const getDashboardSummary = async (req, res, next) => {
  try {
    // 1. Core KPIs
    const kpiRes = await query(`
      SELECT
        (SELECT COUNT(*)::int FROM products) AS total_products,
        (SELECT COUNT(*)::int FROM warehouses) AS total_warehouses,
        (SELECT COUNT(*)::int FROM customers) AS total_customers,
        (SELECT COUNT(*)::int FROM suppliers) AS total_suppliers,
        (SELECT COALESCE(SUM(quantity), 0)::int FROM inventory) AS total_inventory_units,
        (SELECT COALESCE(SUM(reserved_quantity), 0)::int FROM inventory) AS total_reserved_units,
        (SELECT COALESCE(SUM(i.quantity * p.cost_price), 0)::numeric(12,2) 
         FROM inventory i JOIN products p ON i.product_id = p.id) AS inventory_cost_valuation,
        (SELECT COALESCE(SUM(i.quantity * p.price), 0)::numeric(12,2) 
         FROM inventory i JOIN products p ON i.product_id = p.id) AS inventory_retail_valuation,
        (SELECT COUNT(DISTINCT i.id)::int 
         FROM inventory i JOIN products p ON i.product_id = p.id 
         WHERE i.quantity <= p.reorder_level) AS low_stock_alerts_count,
        (SELECT COUNT(*)::int FROM orders) AS total_orders,
        (SELECT COALESCE(SUM(total_amount), 0)::numeric(12,2) FROM orders WHERE status != 'CANCELLED') AS total_revenue,
        (SELECT COUNT(*)::int FROM orders WHERE status IN ('CREATED', 'RESERVED', 'PICKED', 'PACKED')) AS pending_fulfillment_orders,
        (SELECT COUNT(*)::int FROM purchase_orders WHERE status IN ('PENDING', 'ORDERED')) AS active_purchase_orders;
    `);

    // 2. Warehouse Stock Distribution
    const whRes = await query(`
      SELECT 
        w.id,
        w.name,
        w.location,
        COALESCE(SUM(i.quantity), 0)::int AS total_units,
        COALESCE(SUM(i.quantity * p.cost_price), 0)::numeric(12,2) AS valuation
      FROM warehouses w
      LEFT JOIN inventory i ON w.id = i.warehouse_id
      LEFT JOIN products p ON i.product_id = p.id
      GROUP BY w.id
      ORDER BY total_units DESC;
    `);

    // 3. Category Stock Breakdown
    const catRes = await query(`
      SELECT 
        c.id,
        c.name AS category_name,
        COUNT(DISTINCT p.id)::int AS product_count,
        COALESCE(SUM(i.quantity), 0)::int AS total_units,
        COALESCE(SUM(i.quantity * p.cost_price), 0)::numeric(12,2) AS valuation
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      LEFT JOIN inventory i ON p.id = i.product_id
      GROUP BY c.id
      ORDER BY valuation DESC;
    `);

    // 4. Recent Stock Movements (last 8)
    const recentMovementsRes = await query(`
      SELECT 
        sm.id,
        sm.movement_type,
        sm.quantity,
        sm.reference_id,
        sm.created_at,
        p.name AS product_name,
        p.sku,
        w.name AS warehouse_name,
        u.name AS user_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      JOIN warehouses w ON sm.warehouse_id = w.id
      LEFT JOIN users u ON sm.performed_by = u.id
      ORDER BY sm.created_at DESC
      LIMIT 8;
    `);

    // 5. Recent Sales Orders (last 5)
    const recentOrdersRes = await query(`
      SELECT 
        o.id,
        o.status,
        o.total_amount,
        o.created_at,
        c.name AS customer_name,
        w.name AS warehouse_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN warehouses w ON o.warehouse_id = w.id
      ORDER BY o.created_at DESC
      LIMIT 5;
    `);

    // 6. Critical Low Stock Items (top 5 urgent)
    const criticalStockRes = await query(`
      SELECT 
        p.name AS product_name,
        p.sku,
        w.name AS warehouse_name,
        i.quantity,
        p.reorder_level,
        (p.reorder_level - i.quantity) AS deficit
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      JOIN warehouses w ON i.warehouse_id = w.id
      WHERE i.quantity <= p.reorder_level
      ORDER BY deficit DESC
      LIMIT 5;
    `);

    res.status(200).json({
      success: true,
      message: 'Dashboard analytics retrieved successfully.',
      data: {
        summary: kpiRes.rows[0],
        warehouses: whRes.rows,
        categories: catRes.rows,
        recent_movements: recentMovementsRes.rows,
        recent_orders: recentOrdersRes.rows,
        critical_low_stock: criticalStockRes.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Detailed Inventory Valuation Report (FIFO / AVCO Basis)
 * GET /api/reports/inventory-valuation
 */
export const getInventoryValuationReport = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        p.id AS product_id,
        p.sku,
        p.name AS product_name,
        c.name AS category_name,
        w.name AS warehouse_name,
        i.quantity,
        i.reserved_quantity,
        (i.quantity - i.reserved_quantity) AS available_quantity,
        p.cost_price,
        p.price AS selling_price,
        (i.quantity * p.cost_price)::numeric(12,2) AS total_cost_value,
        (i.quantity * p.price)::numeric(12,2) AS total_retail_value,
        ((i.quantity * p.price) - (i.quantity * p.cost_price))::numeric(12,2) AS unrealized_margin
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN warehouses w ON i.warehouse_id = w.id
      WHERE i.quantity > 0
      ORDER BY total_cost_value DESC;
    `);

    const summary = result.rows.reduce(
      (acc, row) => {
        acc.total_units += parseInt(row.quantity, 10);
        acc.total_cost += parseFloat(row.total_cost_value);
        acc.total_retail += parseFloat(row.total_retail_value);
        return acc;
      },
      { total_units: 0, total_cost: 0, total_retail: 0 }
    );

    res.status(200).json({
      success: true,
      message: 'Inventory valuation report generated.',
      data: {
        summary: {
          total_units: summary.total_units,
          total_cost: summary.total_cost.toFixed(2),
          total_retail: summary.total_retail.toFixed(2),
          potential_profit: (summary.total_retail - summary.total_cost).toFixed(2),
          overall_margin_percent: summary.total_retail > 0
            ? (((summary.total_retail - summary.total_cost) / summary.total_retail) * 100).toFixed(1)
            : 0
        },
        records: result.rows
      }
    });
  } catch (error) {
    next(error);
  }
};
