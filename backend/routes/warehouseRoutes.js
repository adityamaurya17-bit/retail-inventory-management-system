import { Router } from 'express';
import {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
} from '../controllers/warehouseController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Read operations: authenticated users
router.get('/', authenticateToken, getWarehouses);
router.get('/:id', authenticateToken, getWarehouseById);

// Admin-only mutations for physical infrastructure
router.post('/', authenticateToken, authorizeRoles('Admin'), createWarehouse);
router.put('/:id', authenticateToken, authorizeRoles('Admin'), updateWarehouse);
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), deleteWarehouse);

export default router;
