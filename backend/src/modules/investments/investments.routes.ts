import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.middleware';
import * as investmentsController from './investments.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Investment routes
router.get('/', investmentsController.getInvestments);
router.get('/:id', investmentsController.getInvestmentById);
router.post('/', investmentsController.createInvestment);
router.put('/:id', investmentsController.updateInvestment);
router.delete('/:id', investmentsController.deleteInvestment);

// Valuation routes
router.get('/valuations/list', investmentsController.getValuations);
router.post('/valuations', investmentsController.createValuation);

export default router;
