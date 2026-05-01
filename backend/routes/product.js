import express from 'express';
import { createProduct, getProducts } from '../controllers/productController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, requireRole(['Manager']), createProduct);
router.get('/', verifyToken, getProducts);

export default router;
