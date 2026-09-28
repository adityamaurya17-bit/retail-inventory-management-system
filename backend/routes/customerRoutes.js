import { Router } from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer
} from '../controllers/customerController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getCustomers);
router.get('/:id', authenticateToken, getCustomerById);
router.post('/', authenticateToken, authorizeRoles('Admin', 'Sales Manager'), createCustomer);
router.put('/:id', authenticateToken, authorizeRoles('Admin', 'Sales Manager'), updateCustomer);

export default router;
