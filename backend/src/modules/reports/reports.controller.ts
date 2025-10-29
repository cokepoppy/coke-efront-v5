import { Request, Response, NextFunction } from 'express';
import { reportsService } from './reports.service';

export class ReportsController {
  // Get fund performance list
  async getFundPerformancesList(req: Request, res: Response, next: NextFunction) {
    try {
      const { fundId, startDate, endDate } = req.query;

      const performances = await reportsService.getFundPerformancesList({
        fundId: fundId as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json({
        success: true,
        data: performances,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  // Get single fund performance report
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

  // Get investment performance list
  async getInvestmentPerformancesList(req: Request, res: Response, next: NextFunction) {
    try {
      const { fundId, investmentId, status, startDate, endDate } = req.query;

      const performances = await reportsService.getInvestmentPerformancesList({
        fundId: fundId as string,
        investmentId: investmentId as string,
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json({
        success: true,
        data: performances,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  // Get single investment performance report
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

  // Get performance summary
  async getPerformanceSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { fundId, startDate, endDate } = req.query;

      const summary = await reportsService.getPerformanceSummary({
        fundId: fundId as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json({
        success: true,
        data: summary,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  // Get portfolio summary report (legacy)
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

  // Investor Reports
  async getInvestorReports(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, pageSize, investorId, fundId, reportType, year, status, search } = req.query;

      const reports = await reportsService.getInvestorReports({
        page: page ? parseInt(page as string) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined,
        investorId: investorId as string,
        fundId: fundId as string,
        reportType: reportType as string,
        year: year ? parseInt(year as string) : undefined,
        status: status as string,
        search: search as string,
      });

      res.json({
        success: true,
        ...reports,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getInvestorReportById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const report = await reportsService.getInvestorReportById(id);

      res.json({
        success: true,
        data: report,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async createInvestorReport(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const report = await reportsService.createInvestorReport(data);

      res.status(201).json({
        success: true,
        data: report,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async generateInvestorReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const report = await reportsService.generateInvestorReport(id);

      res.json({
        success: true,
        data: report,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async sendInvestorReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const report = await reportsService.sendInvestorReport(id);

      res.json({
        success: true,
        data: report,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateInvestorReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body;
      const report = await reportsService.updateInvestorReport(id, data);

      res.json({
        success: true,
        data: report,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteInvestorReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await reportsService.deleteInvestorReport(id);

      res.json({
        success: true,
        message: 'Report deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async downloadInvestorReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // TODO: Implement PDF generation
      res.json({
        success: true,
        message: 'Download functionality not yet implemented',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const reportsController = new ReportsController();
