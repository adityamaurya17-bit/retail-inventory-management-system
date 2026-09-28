import { query } from '../config/db.js';

/**
 * Get all suppliers with metrics
 * GET /api/suppliers
 */
export const getSuppliers = async (req, res, next) => {
  try {
    const { search = '' } = req.query;

    const conditions = [];
    const params = [];

    if (search.trim()) {
      params.push(`%${search.trim()}%`);
      conditions.push(`(s.name ILIKE $${params.length} OR s.email ILIKE $${params.length} OR s.phone ILIKE $${params.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.phone,
        s.address,
        s.created_at,
        COUNT(DISTINCT sp.product_id)::int AS products_count,
        COUNT(DISTINCT po.id)::int AS total_pos,
        COUNT(DISTINCT CASE WHEN po.status IN ('PENDING', 'ORDERED') THEN po.id END)::int AS active_pos
      FROM suppliers s
      LEFT JOIN supplier_products sp ON s.id = sp.supplier_id
      LEFT JOIN purchase_orders po ON s.id = po.supplier_id
      ${whereClause}
      GROUP BY s.id
      ORDER BY s.name ASC;
    `;

    const result = await query(sql, params);

    res.status(200).json({
      success: true,
      message: 'Suppliers retrieved successfully.',
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get supplier by ID with product catalog and PO history
 * GET /api/suppliers/:id
 */
export const getSupplierById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const suppRes = await query(
      `SELECT * FROM suppliers WHERE id = $1;`,
      [id]
    );

    if (suppRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found.' });
    }

    // Catalog
    const catalogRes = await query(
      `SELECT 
        sp.id AS mapping_id,
        sp.product_id,
        p.sku,
        p.name AS product_name,
        c.name AS category_name,
        sp.supplier_price,
        p.cost_price AS internal_cost_price,
        sp.lead_time_days
       FROM supplier_products sp
       JOIN products p ON sp.product_id = p.id
       JOIN categories c ON p.category_id = c.id
       WHERE sp.supplier_id = $1
       ORDER BY p.name ASC;`,
      [id]
    );

    // Purchase orders
    const posRes = await query(
      `SELECT 
        po.id,
        po.status,
        po.total_amount,
        po.expected_date,
        po.created_at,
        w.name AS warehouse_name
       FROM purchase_orders po
       JOIN warehouses w ON po.warehouse_id = w.id
       WHERE po.supplier_id = $1
       ORDER BY po.created_at DESC;`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Supplier retrieved successfully.',
      data: {
        ...suppRes.rows[0],
        catalog: catalogRes.rows,
        purchase_orders: posRes.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new supplier
 * POST /api/suppliers
 */
export const createSupplier = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;

    const result = await query(
      `INSERT INTO suppliers (name, email, phone, address)
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
      message: 'Supplier created successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update supplier
 * PUT /api/suppliers/:id
 */
export const updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    const result = await query(
      `UPDATE suppliers
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
      return res.status(404).json({ success: false, message: 'Supplier not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Map product to supplier
 * POST /api/suppliers/:id/products
 */
export const addSupplierProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { product_id, supplier_price, lead_time_days = 7 } = req.body;

    const result = await query(
      `INSERT INTO supplier_products (supplier_id, product_id, supplier_price, lead_time_days)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (supplier_id, product_id)
       DO UPDATE SET supplier_price = EXCLUDED.supplier_price, lead_time_days = EXCLUDED.lead_time_days
       RETURNING *;`,
      [id, product_id, supplier_price, lead_time_days]
    );

    res.status(200).json({
      success: true,
      message: 'Product mapped to supplier catalog.',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
