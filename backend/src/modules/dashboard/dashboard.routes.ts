import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /dashboard/statistics - Get dashboard statistics
router.get('/statistics', dashboardController.getStatistics.bind(dashboardController));

// GET /dashboard/fund-performance - Get fund performance data
router.get('/fund-performance', dashboardController.getFundPerformance.bind(dashboardController));

// GET /dashboard/investments-by-status - Get investments grouped by status
router.get('/investments-by-status', dashboardController.getInvestmentsByStatus.bind(dashboardController));

// GET /dashboard/investments-by-sector - Get investments grouped by sector
router.get('/investments-by-sector', dashboardController.getInvestmentsBySector.bind(dashboardController));

export default router;
