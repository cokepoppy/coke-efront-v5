import { Router } from 'express';
import { CapitalCallsController } from './capital-calls.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
const capitalCallsController = new CapitalCallsController();

// All capital call routes require authentication
router.use(authenticate);

router.get('/', capitalCallsController.getCapitalCalls);
router.post('/', capitalCallsController.createCapitalCall);
router.get('/:id', capitalCallsController.getCapitalCallById);
router.put('/:id', capitalCallsController.updateCapitalCall);
router.delete('/:id', capitalCallsController.deleteCapitalCall);

// Capital call detail operations
router.put('/details/:detailId', capitalCallsController.updateCapitalCallDetail);

// Get capital calls by fund
router.get('/fund/:fundId', capitalCallsController.getCapitalCallsByFund);

export default router;
