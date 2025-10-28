import { Router } from 'express';
import { distributionsController } from './distributions.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /distributions - Get all distributions
router.get('/', distributionsController.getDistributions.bind(distributionsController));

// GET /distributions/:id - Get distribution by ID
router.get('/:id', distributionsController.getDistributionById.bind(distributionsController));

// POST /distributions - Create new distribution
router.post('/', distributionsController.createDistribution.bind(distributionsController));

// PUT /distributions/:id - Update distribution
router.put('/:id', distributionsController.updateDistribution.bind(distributionsController));

// DELETE /distributions/:id - Delete distribution
router.delete('/:id', distributionsController.deleteDistribution.bind(distributionsController));

export default router;
