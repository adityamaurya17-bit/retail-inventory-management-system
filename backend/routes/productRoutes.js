import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Read operations: authenticated users
router.get('/', authenticateToken, getProducts);
router.get('/:id', authenticateToken, getProductById);

// Create / update: Admin and Inventory Manager
router.post('/', authenticateToken, authorizeRoles('Admin', 'Inventory Manager'), createProduct);
router.put('/:id', authenticateToken, authorizeRoles('Admin', 'Inventory Manager'), updateProduct);

// Delete: Admin only
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), deleteProduct);

export default router;
