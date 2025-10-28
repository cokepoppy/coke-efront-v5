import { Router } from 'express';
import { transactionsController } from './transactions.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /transactions - Get all transactions
router.get('/', transactionsController.getTransactions.bind(transactionsController));

// GET /transactions/:id - Get transaction by ID
router.get('/:id', transactionsController.getTransactionById.bind(transactionsController));

// POST /transactions - Create new transaction
router.post('/', transactionsController.createTransaction.bind(transactionsController));

// PUT /transactions/:id - Update transaction
router.put('/:id', transactionsController.updateTransaction.bind(transactionsController));

// DELETE /transactions/:id - Delete transaction
router.delete('/:id', transactionsController.deleteTransaction.bind(transactionsController));

export default router;
