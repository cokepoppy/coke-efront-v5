import { Request, Response, NextFunction } from 'express';
import { transactionsService } from './transactions.service';

export class TransactionsController {
  async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page,
        pageSize,
        search,
        fundId,
        transactionType,
        startDate,
        endDate,
      } = req.query;

      const result = await transactionsService.getTransactions({
        page: page ? parseInt(page as string) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined,
        search: search as string,
        fundId: fundId as string,
        transactionType: transactionType as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json({
        success: true,
        ...result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const transaction = await transactionsService.getTransactionById(id);

      res.json({
        success: true,
        data: transaction,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async createTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const transaction = await transactionsService.createTransaction({
        ...req.body,
        transactionDate: new Date(req.body.transactionDate),
        settlementDate: req.body.settlementDate
          ? new Date(req.body.settlementDate)
          : undefined,
        createdBy: req.user?.id,
      });

      res.status(201).json({
        success: true,
        data: transaction,
        message: 'Transaction created successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const transaction = await transactionsService.updateTransaction(id, {
        ...req.body,
        transactionDate: req.body.transactionDate
          ? new Date(req.body.transactionDate)
          : undefined,
        settlementDate: req.body.settlementDate
          ? new Date(req.body.settlementDate)
          : undefined,
      });

      res.json({
        success: true,
        data: transaction,
        message: 'Transaction updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await transactionsService.deleteTransaction(id);

      res.json({
        success: true,
        ...result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const transactionsController = new TransactionsController();
