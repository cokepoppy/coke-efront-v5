import { Router } from 'express';
import { FundsController } from './funds.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
const fundsController = new FundsController();

// All fund routes require authentication
router.use(authenticate);

router.get('/', fundsController.getFunds);
router.post('/', fundsController.createFund);
router.get('/:id', fundsController.getFundById);
router.put('/:id', fundsController.updateFund);
router.delete('/:id', fundsController.deleteFund);

// Metrics
router.get('/:id/metrics', fundsController.getFundMetrics);
router.post('/:id/metrics', fundsController.addFundMetric);

// Related data
router.get('/:id/investors', fundsController.getFundInvestors);
router.get('/:id/investments', fundsController.getFundInvestments);

export default router;
