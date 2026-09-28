import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Publicly accessible to authenticated users
router.get('/', authenticateToken, getCategories);

// Category modifications restricted to Admin and Inventory Manager
router.post('/', authenticateToken, authorizeRoles('Admin', 'Inventory Manager'), createCategory);
router.put('/:id', authenticateToken, authorizeRoles('Admin', 'Inventory Manager'), updateCategory);
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), deleteCategory);

export default router;
