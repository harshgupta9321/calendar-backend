// routes/authRoutes.js
import express from 'express';
import { login, createManager } from '../controllers/authController.js';
import {authMiddleware} from '../middlewares/authMiddleware.js';
import {checkRole} from '../middlewares/roleMiddleware.js';
// import { register } from '../controllers/authController.js';

const router = express.Router();

// Login route (public)
router.post('/login', login);

// Create manager (admin-only)
router.post('/create-manager', authMiddleware, checkRole('admin'), createManager);

// router.post('/register', register);
export default router;
