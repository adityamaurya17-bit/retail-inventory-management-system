import { Router } from 'express';
import { getUsers, getRoles } from '../controllers/userController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, authorizeRoles('Admin'), getUsers);
router.get('/roles', authenticateToken, getRoles);

export default router;
