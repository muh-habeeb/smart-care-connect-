import express from 'express';
import { createUser, getUsers } from '../controllers/userController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, requireRole(['Manager']), createUser);
router.get('/', verifyToken, requireRole(['Manager']), getUsers);

export default router;
