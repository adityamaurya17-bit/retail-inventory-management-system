import { Router } from 'express';
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  addSupplierProduct
} from '../controllers/supplierController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getSuppliers);
router.get('/:id', authenticateToken, getSupplierById);
router.post('/', authenticateToken, authorizeRoles('Admin', 'Supplier Manager'), createSupplier);
router.put('/:id', authenticateToken, authorizeRoles('Admin', 'Supplier Manager'), updateSupplier);
router.post('/:id/products', authenticateToken, authorizeRoles('Admin', 'Supplier Manager'), addSupplierProduct);

export default router;
