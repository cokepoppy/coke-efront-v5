import prisma from '../../database/prisma';
import { AppError } from '../../shared/middleware/error.middleware';

export class DistributionsService {
  async getDistributions(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    fundId?: string;
    status?: string;
  }) {
    const { page = 1, pageSize = 20, search, fundId, status } = params;

    const where: any = {};

    if (search) {
      where.OR = [
        { distributionNumber: { equals: parseInt(search) || 0 } },
        { fund: { name: { contains: search } } },
      ];
    }

    if (fundId) {
      where.fundId = fundId;
    }

    if (status) {
      where.status = status;
    }

    const [distributions, total] = await Promise.all([
      prisma.distribution.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { distributionDate: 'desc' },
        include: {
          fund: {
            select: {
              id: true,
              name: true,
              currency: true,
            },
          },
          _count: {
            select: {
              details: true,
            },
          },
        },
      }),
      prisma.distribution.count({ where }),
    ]);

    // Convert Decimal to Number
    const serializedDistributions = distributions.map((dist) => ({
      ...dist,
      totalAmount: Number(dist.totalAmount),
      paidAmount: Number(dist.paidAmount),
    }));

    return {
      data: serializedDistributions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getDistributionById(id: string) {
    const distribution = await prisma.distribution.findUnique({
      where: { id },
      include: {
        fund: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
        details: {
          include: {
            investor: {
              select: {
                id: true,
                name: true,
                email: true,
                investorType: true,
              },
            },
          },
        },
      },
    });

    if (!distribution) {
      throw new AppError(404, 'DISTRIBUTION_NOT_FOUND', 'Distribution not found');
    }

    // Convert Decimal to Number
    return {
      ...distribution,
      totalAmount: Number(distribution.totalAmount),
      paidAmount: Number(distribution.paidAmount),
      details: distribution.details.map((detail) => ({
        ...detail,
        distributionAmount: Number(detail.distributionAmount),
        paidAmount: Number(detail.paidAmount),
        withholdingTax: Number(detail.withholdingTax),
        netAmount: detail.netAmount ? Number(detail.netAmount) : null,
      })),
    };
  }

  async createDistribution(data: {
    fundId: string;
    distributionNumber: number;
    distributionDate: Date;
    paymentDate: Date;
    distributionType: string;
    totalAmount: number;
    status?: string;
    notes?: string;
    createdBy?: string;
    details: Array<{
      investorId: string;
      distributionAmount: number;
      withholdingTax?: number;
    }>;
  }) {
    const distribution = await prisma.distribution.create({
      data: {
        fundId: data.fundId,
        distributionNumber: data.distributionNumber,
        distributionDate: data.distributionDate,
        paymentDate: data.paymentDate,
        distributionType: data.distributionType as any,
        totalAmount: data.totalAmount,
        paidAmount: 0,
        status: (data.status as any) || 'draft',
        notes: data.notes,
        createdBy: data.createdBy,
        details: {
          create: data.details.map((detail) => ({
            investorId: detail.investorId,
            distributionAmount: detail.distributionAmount,
            paidAmount: 0,
            status: 'pending',
            withholdingTax: detail.withholdingTax || 0,
            netAmount:
              detail.distributionAmount - (detail.withholdingTax || 0),
          })),
        },
      },
      include: {
        fund: true,
        details: {
          include: {
            investor: true,
          },
        },
      },
    });

    // Convert Decimal to Number
    return {
      ...distribution,
      totalAmount: Number(distribution.totalAmount),
      paidAmount: Number(distribution.paidAmount),
    };
  }

  async updateDistribution(
    id: string,
    data: {
      distributionDate?: Date;
      paymentDate?: Date;
      status?: string;
      notes?: string;
    }
  ) {
    const existing = await this.getDistributionById(id);

    const distribution = await prisma.distribution.update({
      where: { id },
      data: {
        distributionDate: data.distributionDate,
        paymentDate: data.paymentDate,
        status: data.status as any,
        notes: data.notes,
      },
      include: {
        fund: true,
        details: {
          include: {
            investor: true,
          },
        },
      },
    });

    // Convert Decimal to Number
    return {
      ...distribution,
      totalAmount: Number(distribution.totalAmount),
      paidAmount: Number(distribution.paidAmount),
    };
  }

  async deleteDistribution(id: string) {
    const existing = await this.getDistributionById(id);

    await prisma.distribution.delete({
      where: { id },
    });

    return { message: 'Distribution deleted successfully' };
  }
}

export const distributionsService = new DistributionsService();
