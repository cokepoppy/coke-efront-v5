import prisma from '../../database/prisma';
import { AppError } from '../../shared/middleware/error.middleware';

export class InvestmentsService {
  async getInvestments(params: {
    page?: number;
    limit?: number;
    fundId?: string;
    stage?: string;
    status?: string;
    search?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (params.fundId) {
      where.fundId = params.fundId;
    }

    if (params.stage) {
      where.stage = params.stage;
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.search) {
      where.OR = [
        { companyName: { contains: params.search } },
        { sector: { contains: params.search } },
      ];
    }

    const [investments, total] = await Promise.all([
      prisma.investment.findMany({
        where,
        skip,
        take: limit,
        include: {
          fund: {
            select: {
              id: true,
              name: true,
            },
          },
          valuations: {
            orderBy: { valuationDate: 'desc' },
            take: 1,
          },
        },
        orderBy: { investmentDate: 'desc' },
      }),
      prisma.investment.count({ where }),
    ]);

    return {
      data: investments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getInvestmentById(id: string) {
    const investment = await prisma.investment.findFirst({
      where: { id, deletedAt: null },
      include: {
        fund: true,
        valuations: {
          orderBy: { valuationDate: 'desc' },
        },
        transactions: {
          orderBy: { transactionDate: 'desc' },
        },
      },
    });

    if (!investment) {
      throw new AppError(404, 'NOT_FOUND', 'Investment not found');
    }

    return investment;
  }

  async createInvestment(data: {
    fundId: string;
    companyName: string;
    sector?: string;
    stage?: string;
    region?: string;
    investmentDate: Date;
    initialCost: number;
    ownershipPercentage?: number;
    description?: string;
  }) {
    // Verify fund exists
    const fund = await prisma.fund.findUnique({
      where: { id: data.fundId },
    });

    if (!fund) {
      throw new AppError(404, 'NOT_FOUND', 'Fund not found');
    }

    const investment = await prisma.investment.create({
      data: {
        ...data,
        status: 'ACTIVE',
      },
      include: {
        fund: true,
      },
    });

    return investment;
  }

  async updateInvestment(
    id: string,
    data: {
      companyName?: string;
      sector?: string;
      stage?: string;
      region?: string;
      investmentDate?: Date;
      exitDate?: Date;
      initialCost?: number;
      ownershipPercentage?: number;
      status?: string;
      description?: string;
    }
  ) {
    const investment = await prisma.investment.findFirst({
      where: { id, deletedAt: null },
    });

    if (!investment) {
      throw new AppError(404, 'NOT_FOUND', 'Investment not found');
    }

    const updated = await prisma.investment.update({
      where: { id },
      data,
      include: {
        fund: true,
      },
    });

    return updated;
  }

  async deleteInvestment(id: string) {
    const investment = await prisma.investment.findFirst({
      where: { id, deletedAt: null },
    });

    if (!investment) {
      throw new AppError(404, 'NOT_FOUND', 'Investment not found');
    }

    await prisma.investment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Investment deleted successfully' };
  }

  // Valuations
  async getValuations(investmentId?: string) {
    const where: any = {};

    if (investmentId) {
      where.investmentId = investmentId;
    }

    const valuations = await prisma.valuation.findMany({
      where,
      include: {
        investment: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
      orderBy: { valuationDate: 'desc' },
    });

    return valuations;
  }

  async createValuation(data: {
    investmentId: string;
    valuationDate: Date;
    fairValue: number;
    method?: string;
    notes?: string;
  }) {
    const investment = await prisma.investment.findUnique({
      where: { id: data.investmentId },
    });

    if (!investment) {
      throw new AppError(404, 'NOT_FOUND', 'Investment not found');
    }

    const valuation = await prisma.valuation.create({
      data,
      include: {
        investment: true,
      },
    });

    return valuation;
  }
}
