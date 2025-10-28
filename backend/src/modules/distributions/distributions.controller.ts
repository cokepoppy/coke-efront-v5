import { Request, Response, NextFunction } from 'express';
import { distributionsService } from './distributions.service';

export class DistributionsController {
  async getDistributions(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, pageSize, search, fundId, status } = req.query;

      const result = await distributionsService.getDistributions({
        page: page ? parseInt(page as string) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined,
        search: search as string,
        fundId: fundId as string,
        status: status as string,
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

  async getDistributionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const distribution = await distributionsService.getDistributionById(id);

      res.json({
        success: true,
        data: distribution,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async createDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      const distribution = await distributionsService.createDistribution({
        ...req.body,
        distributionDate: new Date(req.body.distributionDate),
        paymentDate: new Date(req.body.paymentDate),
        createdBy: req.user?.id,
      });

      res.status(201).json({
        success: true,
        data: distribution,
        message: 'Distribution created successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const distribution = await distributionsService.updateDistribution(id, {
        ...req.body,
        distributionDate: req.body.distributionDate
          ? new Date(req.body.distributionDate)
          : undefined,
        paymentDate: req.body.paymentDate
          ? new Date(req.body.paymentDate)
          : undefined,
      });

      res.json({
        success: true,
        data: distribution,
        message: 'Distribution updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await distributionsService.deleteDistribution(id);

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

export const distributionsController = new DistributionsController();
