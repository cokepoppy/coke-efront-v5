import { Response, NextFunction } from 'express';
import { InvestmentsService } from './investments.service';
import { AuthRequest } from '../../shared/middleware/auth.middleware';

const investmentsService = new InvestmentsService();

export const getInvestments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, fundId, stage, status, search } = req.query;

    const result = await investmentsService.getInvestments({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      fundId: fundId as string,
      stage: stage as string,
      status: status as string,
      search: search as string,
    });

    res.json({
      success: true,
      message: 'Investments retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getInvestmentById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const investment = await investmentsService.getInvestmentById(id);

    res.json({
      success: true,
      message: 'Investment retrieved successfully',
      data: investment,
    });
  } catch (error) {
    next(error);
  }
};

export const createInvestment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const investment = await investmentsService.createInvestment(req.body);

    res.status(201).json({
      success: true,
      message: 'Investment created successfully',
      data: investment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInvestment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const investment = await investmentsService.updateInvestment(id, req.body);

    res.json({
      success: true,
      message: 'Investment updated successfully',
      data: investment,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteInvestment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await investmentsService.deleteInvestment(id);

    res.json({
      success: true,
      message: 'Investment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getValuations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { investmentId } = req.query;
    const valuations = await investmentsService.getValuations(
      investmentId as string
    );

    res.json({
      success: true,
      message: 'Valuations retrieved successfully',
      data: valuations,
    });
  } catch (error) {
    next(error);
  }
};

export const createValuation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const valuation = await investmentsService.createValuation(req.body);

    res.status(201).json({
      success: true,
      message: 'Valuation created successfully',
      data: valuation,
    });
  } catch (error) {
    next(error);
  }
};
