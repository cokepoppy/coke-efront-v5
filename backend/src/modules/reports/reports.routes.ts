import { Router } from 'express';
import { reportsController } from './reports.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /reports/portfolio - Get portfolio summary report
router.get('/portfolio', reportsController.getPortfolioSummaryReport.bind(reportsController));

// GET /reports/fund/:fundId - Get fund performance report
router.get('/fund/:fundId', reportsController.getFundPerformanceReport.bind(reportsController));

// GET /reports/investment/:investmentId - Get investment performance report
router.get('/investment/:investmentId', reportsController.getInvestmentPerformanceReport.bind(reportsController));

// GET /reports/investor/:investorId - Get investor statement report
router.get('/investor/:investorId', reportsController.getInvestorStatementReport.bind(reportsController));

export default router;
