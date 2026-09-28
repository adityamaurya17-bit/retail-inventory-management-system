import { Router } from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus
} from '../controllers/orderController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getOrders);
router.get('/:id', authenticateToken, getOrderById);

// Order creation: Admin, Sales Manager
router.post('/', authenticateToken, authorizeRoles('Admin', 'Sales Manager'), createOrder);

// Order status updates: Admin, Sales Manager, Inventory Manager (for warehouse fulfillment stages)
router.put('/:id/status', authenticateToken, authorizeRoles('Admin', 'Sales Manager', 'Inventory Manager'), updateOrderStatus);

export default router;
