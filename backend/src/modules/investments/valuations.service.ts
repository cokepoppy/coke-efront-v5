import { PrismaClient, Valuation, ValuationMethod, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class ValuationsService {
  /**
   * Get valuations with filtering and pagination
   */
  async getValuations(params: {
    page?: number;
    pageSize?: number;
    investmentId?: string;
    valuationMethod?: ValuationMethod;
    audited?: boolean;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  }) {
    const {
      page = 1,
      pageSize = 20,
      investmentId,
      valuationMethod,
      audited,
      startDate,
      endDate,
      search,
    } = params;

    const where: Prisma.ValuationWhereInput = {};

    if (investmentId) {
      where.investmentId = investmentId;
    }

    if (valuationMethod) {
      where.valuationMethod = valuationMethod;
    }

    if (audited !== undefined) {
      where.audited = audited;
    }

    if (startDate || endDate) {
      where.valuationDate = {};
      if (startDate) {
        where.valuationDate.gte = startDate;
      }
      if (endDate) {
        where.valuationDate.lte = endDate;
      }
    }

    if (search) {
      where.OR = [
        { investment: { companyName: { contains: search } } },
        { notes: { contains: search } },
      ];
    }

    const [valuations, total] = await Promise.all([
      prisma.valuation.findMany({
        where,
        include: {
          investment: {
            select: {
              id: true,
              companyName: true,
              fundId: true,
              fund: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { valuationDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.valuation.count({ where }),
    ]);

    return {
      valuations,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get a single valuation by ID
   */
  async getValuationById(id: string) {
    const valuation = await prisma.valuation.findUnique({
      where: { id },
      include: {
        investment: {
          select: {
            id: true,
            companyName: true,
            fundId: true,
            fund: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!valuation) {
      throw new Error('估值记录未找到');
    }

    return valuation;
  }

  /**
   * Get valuations by investment ID
   */
  async getValuationsByInvestmentId(investmentId: string) {
    const valuations = await prisma.valuation.findMany({
      where: { investmentId },
      orderBy: { valuationDate: 'desc' },
    });

    return valuations;
  }

  /**
   * Get latest valuation for an investment
   */
  async getLatestValuation(investmentId: string) {
    const valuation = await prisma.valuation.findFirst({
      where: { investmentId },
      orderBy: { valuationDate: 'desc' },
    });

    return valuation;
  }

  /**
   * Create a new valuation
   */
  async createValuation(data: {
    investmentId: string;
    valuationDate: Date;
    fairValue: number;
    valuationMethod: ValuationMethod;
    multiple?: number;
    notes?: string;
    audited?: boolean;
    createdBy?: string;
  }) {
    // Verify investment exists
    const investment = await prisma.investment.findUnique({
      where: { id: data.investmentId },
    });

    if (!investment) {
      throw new Error('投资项目不存在');
    }

    const valuation = await prisma.valuation.create({
      data: {
        investmentId: data.investmentId,
        valuationDate: data.valuationDate,
        fairValue: data.fairValue,
        valuationMethod: data.valuationMethod,
        multiple: data.multiple,
        notes: data.notes,
        audited: data.audited ?? false,
        createdBy: data.createdBy,
      },
      include: {
        investment: {
          select: {
            id: true,
            companyName: true,
            fundId: true,
            fund: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Update investment's current valuation
    await prisma.investment.update({
      where: { id: data.investmentId },
      data: { currentValuation: data.fairValue },
    });

    return valuation;
  }

  /**
   * Update a valuation
   */
  async updateValuation(
    id: string,
    data: {
      valuationDate?: Date;
      fairValue?: number;
      valuationMethod?: ValuationMethod;
      multiple?: number;
      notes?: string;
      audited?: boolean;
    }
  ) {
    const existingValuation = await prisma.valuation.findUnique({
      where: { id },
    });

    if (!existingValuation) {
      throw new Error('估值记录未找到');
    }

    const valuation = await prisma.valuation.update({
      where: { id },
      data,
      include: {
        investment: {
          select: {
            id: true,
            companyName: true,
            fundId: true,
            fund: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // If this is the latest valuation and fairValue changed, update investment
    if (data.fairValue !== undefined) {
      const latestValuation = await this.getLatestValuation(
        existingValuation.investmentId
      );
      if (latestValuation?.id === id) {
        await prisma.investment.update({
          where: { id: existingValuation.investmentId },
          data: { currentValuation: data.fairValue },
        });
      }
    }

    return valuation;
  }

  /**
   * Delete a valuation
   */
  async deleteValuation(id: string) {
    const valuation = await prisma.valuation.findUnique({
      where: { id },
    });

    if (!valuation) {
      throw new Error('估值记录未找到');
    }

    await prisma.valuation.delete({
      where: { id },
    });

    // Recalculate investment's current valuation
    const latestValuation = await this.getLatestValuation(
      valuation.investmentId
    );
    await prisma.investment.update({
      where: { id: valuation.investmentId },
      data: {
        currentValuation: latestValuation?.fairValue ?? null,
      },
    });

    return { message: '估值记录已删除' };
  }

  /**
   * Get valuation history chart data
   */
  async getValuationHistory(investmentId: string) {
    const valuations = await prisma.valuation.findMany({
      where: { investmentId },
      orderBy: { valuationDate: 'asc' },
      select: {
        valuationDate: true,
        fairValue: true,
        valuationMethod: true,
      },
    });

    return valuations;
  }
}

export const valuationsService = new ValuationsService();
