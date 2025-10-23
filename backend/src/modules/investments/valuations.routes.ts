import { Router } from 'express';
import { valuationsController } from './valuations.controller';

const router = Router();

// Get all valuations with filtering
router.get('/', (req, res) => valuationsController.getValuations(req, res));

// Get a single valuation by ID
router.get('/:id', (req, res) => valuationsController.getValuationById(req, res));

// Get valuations by investment ID
router.get('/investment/:investmentId', (req, res) =>
  valuationsController.getValuationsByInvestmentId(req, res)
);

// Get latest valuation for an investment
router.get('/investment/:investmentId/latest', (req, res) =>
  valuationsController.getLatestValuation(req, res)
);

// Get valuation history chart data
router.get('/investment/:investmentId/history', (req, res) =>
  valuationsController.getValuationHistory(req, res)
);

// Create a new valuation
router.post('/', (req, res) => valuationsController.createValuation(req, res));

// Update a valuation
router.put('/:id', (req, res) => valuationsController.updateValuation(req, res));

// Delete a valuation
router.delete('/:id', (req, res) => valuationsController.deleteValuation(req, res));

export default router;
