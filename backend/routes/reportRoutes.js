import { Router } from 'express';
import {
  getDashboardSummary,
  getInventoryValuationReport
} from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', authenticateToken, getDashboardSummary);
router.get('/inventory-valuation', authenticateToken, getInventoryValuationReport);

export default router;
