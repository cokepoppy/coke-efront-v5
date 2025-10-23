import { Response, NextFunction } from 'express';
import { CapitalCallsService } from './capital-calls.service';
import { ResponseUtil } from '../../shared/utils/response';
import { AuthRequest } from '../../shared/middleware/auth.middleware';

export class CapitalCallsController {
  private capitalCallsService: CapitalCallsService;

  constructor() {
    this.capitalCallsService = new CapitalCallsService();
  }

  getCapitalCalls = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { page, pageSize, fundId, status, search, sortBy, sortOrder } = req.query;

      const { capitalCalls, total, page: currentPage, pageSize: size } =
        await this.capitalCallsService.getCapitalCalls({
          page: page ? parseInt(page as string) : undefined,
          pageSize: pageSize ? parseInt(pageSize as string) : undefined,
          fundId: fundId as string,
          status: status as string,
          search: search as string,
          sortBy: sortBy as string,
          sortOrder: sortOrder as 'asc' | 'desc',
        });

      ResponseUtil.paginated(res, capitalCalls, currentPage, size, total);
    } catch (error) {
      next(error);
    }
  };

  getCapitalCallById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const capitalCall = await this.capitalCallsService.getCapitalCallById(id);
      ResponseUtil.success(res, capitalCall);
    } catch (error) {
      next(error);
    }
  };

  createCapitalCall = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const capitalCall = await this.capitalCallsService.createCapitalCall(req.body);
      ResponseUtil.success(res, capitalCall, 'Capital call created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  updateCapitalCall = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const capitalCall = await this.capitalCallsService.updateCapitalCall(id, req.body);
      ResponseUtil.success(res, capitalCall, 'Capital call updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteCapitalCall = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.capitalCallsService.deleteCapitalCall(id);
      ResponseUtil.success(res, result, 'Capital call deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  updateCapitalCallDetail = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { detailId } = req.params;
      const detail = await this.capitalCallsService.updateCapitalCallDetail(
        detailId,
        req.body
      );
      ResponseUtil.success(res, detail, 'Capital call detail updated successfully');
    } catch (error) {
      next(error);
    }
  };

  getCapitalCallsByFund = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { fundId } = req.params;
      const capitalCalls = await this.capitalCallsService.getCapitalCallsByFund(fundId);
      ResponseUtil.success(res, capitalCalls);
    } catch (error) {
      next(error);
    }
  };
}
