import prisma from '../../database/prisma';
import { AppError } from '../../shared/middleware/error.middleware';
import { Prisma } from '@prisma/client';

export class FundsService {
  async getFunds(params: {
    page?: number;
    pageSize?: number;
    status?: string;
    fundType?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      pageSize = 20,
      status,
      fundType,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const where: Prisma.FundWhereInput = {
      deletedAt: null,
    };

    if (status) {
      where.status = status as any;
    }

    if (fundType) {
      where.fundType = fundType as any;
    }

    if (search) {
      where.name = {
        contains: search,
      };
    }

    const [funds, total] = await Promise.all([
      prisma.fund.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          fundType: true,
          totalSize: true,
          currency: true,
          vintageYear: true,
          inceptionDate: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              investments: true,
              fundInvestors: true,
            },
          },
        },
      }),
      prisma.fund.count({ where }),
    ]);

    return { funds, total, page, pageSize };
  }

  async getFundById(id: string) {
    const fund = await prisma.fund.findUnique({
      where: { id },
      include: {
        metrics: {
          orderBy: { asOfDate: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            investments: true,
            fundInvestors: true,
            capitalCalls: true,
            distributions: true,
          },
        },
      },
    });

    if (!fund || fund.deletedAt) {
      throw new AppError(404, 'FUND_NOT_FOUND', 'Fund not found');
    }

    return fund;
  }

  async createFund(data: {
    name: string;
    fundType: string;
    totalSize: number;
    currency?: string;
    vintageYear: number;
    inceptionDate: Date;
    fundTerm?: number;
    extensionPeriod?: number;
    managerId?: string;
    custodianBank?: string;
    domicile?: string;
    managementFeeRate?: number;
    performanceFeeRate?: number;
    hurdleRate?: number;
  }) {
    const fund = await prisma.fund.create({
      data: {
        ...data,
        fundType: data.fundType as any,
      },
    });

    return fund;
  }

  async updateFund(
    id: string,
    data: Partial<{
      name: string;
      fundType: string;
      totalSize: number;
      currency: string;
      vintageYear: number;
      inceptionDate: Date;
      fundTerm: number;
      extensionPeriod: number;
      status: string;
      managerId: string;
      custodianBank: string;
      domicile: string;
      managementFeeRate: number;
      performanceFeeRate: number;
      hurdleRate: number;
    }>
  ) {
    const fund = await prisma.fund.findUnique({ where: { id } });

    if (!fund || fund.deletedAt) {
      throw new AppError(404, 'FUND_NOT_FOUND', 'Fund not found');
    }

    const updated = await prisma.fund.update({
      where: { id },
      data: {
        ...data,
        fundType: data.fundType as any,
        status: data.status as any,
      },
    });

    return updated;
  }

  async deleteFund(id: string) {
    const fund = await prisma.fund.findUnique({ where: { id } });

    if (!fund || fund.deletedAt) {
      throw new AppError(404, 'FUND_NOT_FOUND', 'Fund not found');
    }

    // Soft delete
    await prisma.fund.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Fund deleted successfully' };
  }

  async getFundMetrics(fundId: string, params?: { startDate?: Date; endDate?: Date }) {
    const fund = await prisma.fund.findUnique({ where: { id: fundId } });

    if (!fund || fund.deletedAt) {
      throw new AppError(404, 'FUND_NOT_FOUND', 'Fund not found');
    }

    const where: Prisma.FundMetricWhereInput = { fundId };

    if (params?.startDate || params?.endDate) {
      where.asOfDate = {};
      if (params.startDate) {
        where.asOfDate.gte = params.startDate;
      }
      if (params.endDate) {
        where.asOfDate.lte = params.endDate;
      }
    }

    const metrics = await prisma.fundMetric.findMany({
      where,
      orderBy: { asOfDate: 'desc' },
    });

    return metrics;
  }

  async addFundMetric(
    fundId: string,
    data: {
      asOfDate: Date;
      nav?: number;
      irr?: number;
      moic?: number;
      dpi?: number;
      rvpi?: number;
      tvpi?: number;
      committedCapital?: number;
      calledCapital?: number;
      distributedCapital?: number;
      remainingValue?: number;
    }
  ) {
    const fund = await prisma.fund.findUnique({ where: { id: fundId } });

    if (!fund || fund.deletedAt) {
      throw new AppError(404, 'FUND_NOT_FOUND', 'Fund not found');
    }

    const metric = await prisma.fundMetric.create({
      data: {
        fundId,
        ...data,
      },
    });

    return metric;
  }

  async getFundInvestors(fundId: string) {
    const fund = await prisma.fund.findUnique({ where: { id: fundId } });

    if (!fund || fund.deletedAt) {
      throw new AppError(404, 'FUND_NOT_FOUND', 'Fund not found');
    }

    const fundInvestors = await prisma.fundInvestor.findMany({
      where: { fundId },
      include: {
        investor: {
          select: {
            id: true,
            name: true,
            investorType: true,
            email: true,
            status: true,
          },
        },
      },
    });

    return fundInvestors;
  }

  async getFundInvestments(fundId: string) {
    const fund = await prisma.fund.findUnique({ where: { id: fundId } });

    if (!fund || fund.deletedAt) {
      throw new AppError(404, 'FUND_NOT_FOUND', 'Fund not found');
    }

    const investments = await prisma.investment.findMany({
      where: { fundId, deletedAt: null },
      select: {
        id: true,
        companyName: true,
        industry: true,
        investmentDate: true,
        investmentStage: true,
        initialInvestment: true,
        currentValuation: true,
        status: true,
      },
      orderBy: { investmentDate: 'desc' },
    });

    return investments;
  }
}
