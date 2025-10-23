import { Response, NextFunction } from 'express';
import { InvestorsService } from './investors.service';
import { ResponseUtil } from '../../shared/utils/response';
import { AuthRequest } from '../../shared/middleware/auth.middleware';

export class InvestorsController {
  private investorsService: InvestorsService;

  constructor() {
    this.investorsService = new InvestorsService();
  }

  getInvestors = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { page, pageSize, investorType, status, kycStatus, search, sortBy, sortOrder } =
        req.query;

      const { investors, total, page: currentPage, pageSize: size } = await this.investorsService.getInvestors({
        page: page ? parseInt(page as string) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined,
        investorType: investorType as string,
        status: status as string,
        kycStatus: kycStatus as string,
        search: search as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      ResponseUtil.paginated(res, investors, currentPage, size, total);
    } catch (error) {
      next(error);
    }
  };

  getInvestorById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const investor = await this.investorsService.getInvestorById(id);
      ResponseUtil.success(res, investor);
    } catch (error) {
      next(error);
    }
  };

  createInvestor = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const investor = await this.investorsService.createInvestor(req.body);
      ResponseUtil.success(res, investor, 'Investor created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  updateInvestor = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const investor = await this.investorsService.updateInvestor(id, req.body);
      ResponseUtil.success(res, investor, 'Investor updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteInvestor = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.investorsService.deleteInvestor(id);
      ResponseUtil.success(res, result, 'Investor deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  getInvestorFunds = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const funds = await this.investorsService.getInvestorFunds(id);
      ResponseUtil.success(res, funds);
    } catch (error) {
      next(error);
    }
  };

  getInvestorCapitalCalls = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const capitalCalls = await this.investorsService.getInvestorCapitalCalls(id);
      ResponseUtil.success(res, capitalCalls);
    } catch (error) {
      next(error);
    }
  };

  getInvestorDistributions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const distributions = await this.investorsService.getInvestorDistributions(id);
      ResponseUtil.success(res, distributions);
    } catch (error) {
      next(error);
    }
  };
}
