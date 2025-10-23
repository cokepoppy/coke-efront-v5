import { Response, NextFunction } from 'express';
import { FundsService } from './funds.service';
import { ResponseUtil } from '../../shared/utils/response';
import { AuthRequest } from '../../shared/middleware/auth.middleware';

export class FundsController {
  private fundsService: FundsService;

  constructor() {
    this.fundsService = new FundsService();
  }

  getFunds = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { page, pageSize, status, fundType, search, sortBy, sortOrder } =
        req.query;

      const { funds, total, page: currentPage, pageSize: size } = await this.fundsService.getFunds({
        page: page ? parseInt(page as string) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined,
        status: status as string,
        fundType: fundType as string,
        search: search as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      ResponseUtil.paginated(res, funds, currentPage, size, total);
    } catch (error) {
      next(error);
    }
  };

  getFundById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const fund = await this.fundsService.getFundById(id);
      ResponseUtil.success(res, fund);
    } catch (error) {
      next(error);
    }
  };

  createFund = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const fund = await this.fundsService.createFund(req.body);
      ResponseUtil.success(res, fund, 'Fund created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  updateFund = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const fund = await this.fundsService.updateFund(id, req.body);
      ResponseUtil.success(res, fund, 'Fund updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteFund = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.fundsService.deleteFund(id);
      ResponseUtil.success(res, result, 'Fund deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  getFundMetrics = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const metrics = await this.fundsService.getFundMetrics(id, {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      ResponseUtil.success(res, metrics);
    } catch (error) {
      next(error);
    }
  };

  addFundMetric = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const metric = await this.fundsService.addFundMetric(id, req.body);
      ResponseUtil.success(res, metric, 'Metric added successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  getFundInvestors = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const investors = await this.fundsService.getFundInvestors(id);
      ResponseUtil.success(res, investors);
    } catch (error) {
      next(error);
    }
  };

  getFundInvestments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const investments = await this.fundsService.getFundInvestments(id);
      ResponseUtil.success(res, investments);
    } catch (error) {
      next(error);
    }
  };
}
