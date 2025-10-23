import { Request, Response } from 'express';
import { valuationsService } from './valuations.service';
import { ResponseUtil } from '../../shared/utils/response';
import { ValuationMethod } from '@prisma/client';

export class ValuationsController {
  /**
   * Get all valuations with filtering
   */
  async getValuations(req: Request, res: Response) {
    try {
      const {
        page,
        pageSize,
        investmentId,
        valuationMethod,
        audited,
        startDate,
        endDate,
        search,
      } = req.query;

      const result = await valuationsService.getValuations({
        page: page ? parseInt(page as string) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined,
        investmentId: investmentId as string,
        valuationMethod: valuationMethod as ValuationMethod,
        audited: audited ? audited === 'true' : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        search: search as string,
      });

      return ResponseUtil.paginated(
        res,
        result.valuations,
        result.pagination,
        '获取估值列表成功'
      );
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Get a single valuation by ID
   */
  async getValuationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const valuation = await valuationsService.getValuationById(id);
      return ResponseUtil.success(res, valuation, '获取估值详情成功');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Get valuations by investment ID
   */
  async getValuationsByInvestmentId(req: Request, res: Response) {
    try {
      const { investmentId } = req.params;
      const valuations = await valuationsService.getValuationsByInvestmentId(
        investmentId
      );
      return ResponseUtil.success(res, valuations, '获取投资估值列表成功');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Get latest valuation for an investment
   */
  async getLatestValuation(req: Request, res: Response) {
    try {
      const { investmentId } = req.params;
      const valuation = await valuationsService.getLatestValuation(
        investmentId
      );
      return ResponseUtil.success(res, valuation, '获取最新估值成功');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Create a new valuation
   */
  async createValuation(req: Request, res: Response) {
    try {
      const {
        investmentId,
        valuationDate,
        fairValue,
        valuationMethod,
        multiple,
        notes,
        audited,
        createdBy,
      } = req.body;

      if (!investmentId || !valuationDate || !fairValue || !valuationMethod) {
        return ResponseUtil.error(res, '缺少必需字段', 400);
      }

      const valuation = await valuationsService.createValuation({
        investmentId,
        valuationDate: new Date(valuationDate),
        fairValue: parseFloat(fairValue),
        valuationMethod,
        multiple: multiple ? parseFloat(multiple) : undefined,
        notes,
        audited,
        createdBy,
      });

      return ResponseUtil.success(res, valuation, '估值创建成功', 201);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Update a valuation
   */
  async updateValuation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        valuationDate,
        fairValue,
        valuationMethod,
        multiple,
        notes,
        audited,
      } = req.body;

      const valuation = await valuationsService.updateValuation(id, {
        valuationDate: valuationDate ? new Date(valuationDate) : undefined,
        fairValue: fairValue ? parseFloat(fairValue) : undefined,
        valuationMethod,
        multiple: multiple ? parseFloat(multiple) : undefined,
        notes,
        audited,
      });

      return ResponseUtil.success(res, valuation, '估值更新成功');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Delete a valuation
   */
  async deleteValuation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await valuationsService.deleteValuation(id);
      return ResponseUtil.success(res, result, '估值删除成功');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }

  /**
   * Get valuation history chart data
   */
  async getValuationHistory(req: Request, res: Response) {
    try {
      const { investmentId } = req.params;
      const history = await valuationsService.getValuationHistory(
        investmentId
      );
      return ResponseUtil.success(res, history, '获取估值历史成功');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message);
    }
  }
}

export const valuationsController = new ValuationsController();
