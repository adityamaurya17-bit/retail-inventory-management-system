import { query, getClient } from '../config/db.js';

/**
 * Get all products with search, category filtering, low-stock filter, and stock aggregations
 * GET /api/products
 */
export const getProducts = async (req, res, next) => {
  try {
    const {
      search = '',
      category_id,
      low_stock,
      warehouse_id,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const conditions = [];
    const params = [];

    if (search.trim()) {
      params.push(`%${search.trim()}%`);
      conditions.push(`(p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
    }

    if (category_id) {
      params.push(parseInt(category_id, 10));
      conditions.push(`p.category_id = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const allowedSortFields = {
      name: 'p.name',
      sku: 'p.sku',
      price: 'p.price',
      cost_price: 'p.cost_price',
      reorder_level: 'p.reorder_level',
      created_at: 'p.created_at',
      total_stock: 'total_stock'
    };

    const sortColumn = allowedSortFields[sortBy] || 'p.name';
    const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Query product list with aggregated inventory
    const sql = `
      SELECT 
        p.id,
        p.sku,
        p.name,
        p.description,
        p.price,
        p.cost_price,
        p.reorder_level,
        p.created_at,
        p.updated_at,
        c.id AS category_id,
        c.name AS category_name,
        COALESCE(SUM(i.quantity), 0)::int AS total_stock,
        COALESCE(SUM(i.reserved_quantity), 0)::int AS total_reserved,
        (COALESCE(SUM(i.quantity), 0) - COALESCE(SUM(i.reserved_quantity), 0))::int AS available_stock,
        CASE 
          WHEN COALESCE(SUM(i.quantity), 0) <= p.reorder_level THEN true 
          ELSE false 
        END AS is_low_stock
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN inventory i ON p.id = i.product_id
      ${whereClause}
      GROUP BY p.id, c.id
      ${low_stock === 'true' ? 'HAVING COALESCE(SUM(i.quantity), 0) <= p.reorder_level' : ''}
      ORDER BY ${sortColumn} ${direction}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2};
    `;

    params.push(parseInt(limit, 10), offset);
    const result = await query(sql, params);

    // Count total products for pagination
    const countSql = `
      SELECT COUNT(DISTINCT p.id)::int AS total
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      ${whereClause}
      ${low_stock === 'true' ? 'GROUP BY p.id HAVING COALESCE(SUM(i.quantity), 0) <= p.reorder_level' : ''};
    `;
    const countParams = params.slice(0, conditions.length);
    const countRes = await query(countSql, countParams);
    const totalCount = low_stock === 'true' ? countRes.rowCount : (countRes.rows[0]?.total || 0);

    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully.',
      data: {
        products: result.rows,
        pagination: {
          total: totalCount,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(totalCount / parseInt(limit, 10))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by ID with per-warehouse inventory breakdown
 * GET /api/products/:id
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const prodRes = await query(
      `SELECT 
        p.*, 
        c.name AS category_name,
        COALESCE(SUM(i.quantity), 0)::int AS total_stock,
        COALESCE(SUM(i.reserved_quantity), 0)::int AS total_reserved,
        (COALESCE(SUM(i.quantity), 0) - COALESCE(SUM(i.reserved_quantity), 0))::int AS available_stock
       FROM products p
       JOIN categories c ON p.category_id = c.id
       LEFT JOIN inventory i ON p.id = i.product_id
       WHERE p.id = $1
       GROUP BY p.id, c.name;`,
      [id]
    );

    if (prodRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Warehouse inventory breakdown
    const invRes = await query(
      `SELECT 
        w.id AS warehouse_id,
        w.name AS warehouse_name,
        w.location,
        COALESCE(i.quantity, 0)::int AS quantity,
        COALESCE(i.reserved_quantity, 0)::int AS reserved_quantity,
        (COALESCE(i.quantity, 0) - COALESCE(i.reserved_quantity, 0))::int AS available_quantity,
        i.updated_at
       FROM warehouses w
       LEFT JOIN inventory i ON w.id = i.warehouse_id AND i.product_id = $1
       ORDER BY w.name ASC;`,
      [id]
    );

    // Supplier suppliers for this product
    const suppRes = await query(
      `SELECT 
        s.id AS supplier_id,
        s.name AS supplier_name,
        sp.supplier_price,
        sp.lead_time_days
       FROM supplier_products sp
       JOIN suppliers s ON sp.supplier_id = s.id
       WHERE sp.product_id = $1;`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully.',
      data: {
        ...prodRes.rows[0],
        warehouses: invRes.rows,
        suppliers: suppRes.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new product
 * POST /api/products
 */
export const createProduct = async (req, res, next) => {
  const client = await getClient();
  try {
    const {
      sku,
      name,
      description,
      category_id,
      price,
      cost_price,
      reorder_level = 10,
      initial_warehouse_id,
      initial_stock = 0
    } = req.body;

    // Validate price margin
    if (parseFloat(price) < parseFloat(cost_price)) {
      return res.status(400).json({
        success: false,
        message: 'Selling price must be greater than or equal to cost price.'
      });
    }

    await client.query('BEGIN');

    // Insert Product
    const insertRes = await client.query(
      `INSERT INTO products (sku, name, description, category_id, price, cost_price, reorder_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *;`,
      [
        sku.trim().toUpperCase(),
        name.trim(),
        description ? description.trim() : null,
        category_id,
        price,
        cost_price,
        reorder_level
      ]
    );

    const newProduct = insertRes.rows[0];

    // If initial stock and warehouse provided, initialize inventory
    if (initial_warehouse_id && parseInt(initial_stock, 10) > 0) {
      await client.query(
        `INSERT INTO inventory (product_id, warehouse_id, quantity, reserved_quantity)
         VALUES ($1, $2, $3, 0)
         ON CONFLICT (product_id, warehouse_id) 
         DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity;`,
        [newProduct.id, initial_warehouse_id, parseInt(initial_stock, 10)]
      );

      // Audit movement
      await client.query(
        `INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, reference_id, notes, performed_by)
         VALUES ($1, $2, 'ADJUSTMENT', $3, 'INITIAL_SETUP', 'Initial inventory creation', $4);`,
        [newProduct.id, initial_warehouse_id, parseInt(initial_stock, 10), req.user ? req.user.id : null]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: newProduct
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

/**
 * Update an existing product
 * PUT /api/products/:id
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      sku,
      name,
      description,
      category_id,
      price,
      cost_price,
      reorder_level
    } = req.body;

    // Check existing
    const existing = await query('SELECT * FROM products WHERE id = $1;', [id]);
    if (existing.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const current = existing.rows[0];
    const newPrice = price !== undefined ? parseFloat(price) : parseFloat(current.price);
    const newCost = cost_price !== undefined ? parseFloat(cost_price) : parseFloat(current.cost_price);

    if (newPrice < newCost) {
      return res.status(400).json({
        success: false,
        message: 'Selling price must be greater than or equal to cost price.'
      });
    }

    const updateRes = await query(
      `UPDATE products
       SET sku = COALESCE($1, sku),
           name = COALESCE($2, name),
           description = COALESCE($3, description),
           category_id = COALESCE($4, category_id),
           price = COALESCE($5, price),
           cost_price = COALESCE($6, cost_price),
           reorder_level = COALESCE($7, reorder_level),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *;`,
      [
        sku ? sku.trim().toUpperCase() : null,
        name ? name.trim() : null,
        description !== undefined ? description : null,
        category_id || null,
        price !== undefined ? price : null,
        cost_price !== undefined ? cost_price : null,
        reorder_level !== undefined ? reorder_level : null,
        id
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: updateRes.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a product
 * DELETE /api/products/:id
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent deletion if physical stock exists
    const stockCheck = await query(
      `SELECT SUM(quantity)::int AS total_stock FROM inventory WHERE product_id = $1;`,
      [id]
    );
    if (stockCheck.rows[0]?.total_stock > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete product with existing inventory (${stockCheck.rows[0].total_stock} units). Adjust stock to zero first.`
      });
    }

    // Check order line items
    const orderCheck = await query(
      `SELECT 1 FROM order_items WHERE product_id = $1 LIMIT 1;`,
      [id]
    );
    if (orderCheck.rowCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product referenced in historical sales orders.'
      });
    }

    const delRes = await query('DELETE FROM products WHERE id = $1 RETURNING id;', [id]);
    if (delRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
      data: { id: parseInt(id, 10) }
    });
  } catch (error) {
    next(error);
  }
};
