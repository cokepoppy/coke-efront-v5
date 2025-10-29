import { Router } from 'express';
import { reportsController } from './reports.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Performance Summary
router.get('/performance-summary', reportsController.getPerformanceSummary.bind(reportsController));

// Fund Performance
router.get('/fund-performance', reportsController.getFundPerformancesList.bind(reportsController));
router.get('/fund-performance/:fundId', reportsController.getFundPerformanceReport.bind(reportsController));

// Investment Performance
router.get('/investment-performance', reportsController.getInvestmentPerformancesList.bind(reportsController));
router.get('/investment-performance/:investmentId', reportsController.getInvestmentPerformanceReport.bind(reportsController));

// Investor Reports
router.get('/investor-reports', reportsController.getInvestorReports.bind(reportsController));
router.get('/investor-reports/:id', reportsController.getInvestorReportById.bind(reportsController));
router.post('/investor-reports', reportsController.createInvestorReport.bind(reportsController));
router.post('/investor-reports/:id/generate', reportsController.generateInvestorReport.bind(reportsController));
router.post('/investor-reports/:id/send', reportsController.sendInvestorReport.bind(reportsController));
router.put('/investor-reports/:id', reportsController.updateInvestorReport.bind(reportsController));
router.delete('/investor-reports/:id', reportsController.deleteInvestorReport.bind(reportsController));
router.get('/investor-reports/:id/download', reportsController.downloadInvestorReport.bind(reportsController));

// Legacy routes
router.get('/portfolio', reportsController.getPortfolioSummaryReport.bind(reportsController));
router.get('/fund/:fundId', reportsController.getFundPerformanceReport.bind(reportsController));
router.get('/investment/:investmentId', reportsController.getInvestmentPerformanceReport.bind(reportsController));
router.get('/investor/:investorId', reportsController.getInvestorStatementReport.bind(reportsController));

export default router;
