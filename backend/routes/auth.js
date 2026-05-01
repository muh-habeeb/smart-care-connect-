import express from 'express';
import { login, logout, getMe, changePassword, forgotPassword, resetPassword } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', verifyToken, getMe);
router.post('/change-password', verifyToken, changePassword);

export default router;
