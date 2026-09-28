import { query } from '../config/db.js';

/**
 * Get all product categories
 * GET /api/categories
 */
export const getCategories = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT c.*, COUNT(p.id)::int AS product_count 
       FROM categories c 
       LEFT JOIN products p ON c.id = p.category_id 
       GROUP BY c.id 
       ORDER BY c.name ASC;`
    );
    res.status(200).json({
      success: true,
      message: 'Categories fetched successfully.',
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new category
 * POST /api/categories
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const result = await query(
      `INSERT INTO categories (name, description)
       VALUES ($1, $2)
       RETURNING *;`,
      [name.trim(), description ? description.trim() : null]
    );
    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a category
 * PUT /api/categories/:id
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const result = await query(
      `UPDATE categories
       SET name = COALESCE($1, name),
           description = COALESCE($2, description)
       WHERE id = $3
       RETURNING *;`,
      [name ? name.trim() : null, description ? description.trim() : null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a category
 * DELETE /api/categories/:id
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Check if category has products
    const prodCheck = await query('SELECT id FROM products WHERE category_id = $1 LIMIT 1;', [id]);
    if (prodCheck.rowCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category that currently contains active products. Please reassign products first.'
      });
    }

    const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id;', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully.',
      data: { id: parseInt(id, 10) }
    });
  } catch (error) {
    next(error);
  }
};
