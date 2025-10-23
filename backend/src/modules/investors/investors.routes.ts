import { Router } from 'express';
import { InvestorsController } from './investors.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
const investorsController = new InvestorsController();

// All investor routes require authentication
router.use(authenticate);

router.get('/', investorsController.getInvestors);
router.post('/', investorsController.createInvestor);
router.get('/:id', investorsController.getInvestorById);
router.put('/:id', investorsController.updateInvestor);
router.delete('/:id', investorsController.deleteInvestor);

// Related data
router.get('/:id/funds', investorsController.getInvestorFunds);
router.get('/:id/capital-calls', investorsController.getInvestorCapitalCalls);
router.get('/:id/distributions', investorsController.getInvestorDistributions);

export default router;
