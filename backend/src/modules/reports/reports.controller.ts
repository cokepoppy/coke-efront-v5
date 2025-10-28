import { Request, Response, NextFunction } from 'express';
import { reportsService } from './reports.service';

export class ReportsController {
  async getFundPerformanceReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { fundId } = req.params;
      const { startDate, endDate } = req.query;

      const report = await reportsService.getFundPerformanceReport(
        fundId,
        startDate as string,
        endDate as string
      );

      res.json({
        success: true,
        data: report,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getInvestmentPerformanceReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { investmentId } = req.params;

      const report = await reportsService.getInvestmentPerformanceReport(investmentId);

      res.json({
        success: true,
        data: report,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getInvestorStatementReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { investorId } = req.params;
      const { fundId, startDate, endDate } = req.query;

      const report = await reportsService.getInvestorStatementReport(
        investorId,
        fundId as string,
        startDate as string,
        endDate as string
      );

      res.json({
        success: true,
        data: report,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getPortfolioSummaryReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await reportsService.getPortfolioSummaryReport();

      res.json({
        success: true,
        data: report,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const reportsController = new ReportsController();
