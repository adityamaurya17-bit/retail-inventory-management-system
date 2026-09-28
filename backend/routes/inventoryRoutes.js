import { Router } from 'express';
import {
  getInventory,
  getLowStockAlerts,
  adjustStock,
  transferStock,
  getStockMovements
} from '../controllers/inventoryController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Read inventory data
router.get('/', authenticateToken, getInventory);
router.get('/low-stock', authenticateToken, getLowStockAlerts);
router.get('/movements', authenticateToken, getStockMovements);

// Inventory adjustments and transfers: Admin & Inventory Manager
router.post('/adjust', authenticateToken, authorizeRoles('Admin', 'Inventory Manager'), adjustStock);
router.post('/transfer', authenticateToken, authorizeRoles('Admin', 'Inventory Manager'), transferStock);

export default router;
