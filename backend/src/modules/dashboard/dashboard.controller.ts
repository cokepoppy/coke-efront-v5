import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';

export class DashboardController {
  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getStatistics();

      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getFundPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getFundPerformance();

      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getInvestmentsByStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getInvestmentsByStatus();

      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getInvestmentsBySector(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getInvestmentsBySector();

      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
