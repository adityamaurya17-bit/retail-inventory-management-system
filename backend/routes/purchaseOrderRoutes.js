import { Router } from 'express';
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  receivePurchaseOrder
} from '../controllers/purchaseOrderController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getPurchaseOrders);
router.get('/:id', authenticateToken, getPurchaseOrderById);

// Create PO: Admin, Supplier Manager
router.post('/', authenticateToken, authorizeRoles('Admin', 'Supplier Manager'), createPurchaseOrder);

// Goods Receipt: Admin, Inventory Manager, Supplier Manager
router.put('/:id/receive', authenticateToken, authorizeRoles('Admin', 'Inventory Manager', 'Supplier Manager'), receivePurchaseOrder);

export default router;
