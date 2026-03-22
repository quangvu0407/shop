import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js'; // Assuming you have auth

const adminRouter = express.Router();

adminRouter.get('/dashboard-stats', adminAuth, getDashboardStats);

export default adminRouter;