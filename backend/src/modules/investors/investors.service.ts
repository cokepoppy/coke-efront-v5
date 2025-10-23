import prisma from '../../database/prisma';
import { AppError } from '../../shared/middleware/error.middleware';
import { Prisma } from '@prisma/client';

export class InvestorsService {
  async getInvestors(params: {
    page?: number;
    pageSize?: number;
    investorType?: string;
    status?: string;
    kycStatus?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      pageSize = 20,
      investorType,
      status,
      kycStatus,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const where: Prisma.InvestorWhereInput = {
      deletedAt: null,
    };

    if (investorType) {
      where.investorType = investorType as any;
    }

    if (status) {
      where.status = status as any;
    }

    if (kycStatus) {
      where.kycStatus = kycStatus as any;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { taxId: { contains: search } },
      ];
    }

    const [investors, total] = await Promise.all([
      prisma.investor.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          investorType: true,
          entityType: true,
          domicile: true,
          country: true,
          email: true,
          phone: true,
          kycStatus: true,
          kycDate: true,
          amlStatus: true,
          amlDate: true,
          accredited: true,
          firstInvestmentDate: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              fundInvestors: true,
            },
          },
        },
      }),
      prisma.investor.count({ where }),
    ]);

    return { investors, total, page, pageSize };
  }

  async getInvestorById(id: string) {
    const investor = await prisma.investor.findUnique({
      where: { id },
      include: {
        fundInvestors: {
          include: {
            fund: {
              select: {
                id: true,
                name: true,
                fundType: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: {
            capitalCallDetails: true,
            distributionDetails: true,
          },
        },
      },
    });

    if (!investor || investor.deletedAt) {
      throw new AppError('Investor not found', 404);
    }

    return investor;
  }

  async createInvestor(data: Prisma.InvestorCreateInput) {
    const investor = await prisma.investor.create({
      data,
      include: {
        _count: {
          select: {
            fundInvestors: true,
          },
        },
      },
    });

    return investor;
  }

  async updateInvestor(id: string, data: Prisma.InvestorUpdateInput) {
    const investor = await prisma.investor.findUnique({
      where: { id },
    });

    if (!investor || investor.deletedAt) {
      throw new AppError('Investor not found', 404);
    }

    const updated = await prisma.investor.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            fundInvestors: true,
          },
        },
      },
    });

    return updated;
  }

  async deleteInvestor(id: string) {
    const investor = await prisma.investor.findUnique({
      where: { id },
    });

    if (!investor || investor.deletedAt) {
      throw new AppError('Investor not found', 404);
    }

    // Soft delete
    await prisma.investor.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: 'Investor deleted successfully' };
  }

  async getInvestorFunds(id: string) {
    const investor = await prisma.investor.findUnique({
      where: { id },
    });

    if (!investor || investor.deletedAt) {
      throw new AppError('Investor not found', 404);
    }

    const fundInvestors = await prisma.fundInvestor.findMany({
      where: {
        investorId: id,
      },
      include: {
        fund: {
          select: {
            id: true,
            name: true,
            fundType: true,
            status: true,
            totalSize: true,
            currency: true,
            vintageYear: true,
          },
        },
      },
      orderBy: {
        commitmentDate: 'desc',
      },
    });

    return fundInvestors;
  }

  async getInvestorCapitalCalls(id: string) {
    const investor = await prisma.investor.findUnique({
      where: { id },
    });

    if (!investor || investor.deletedAt) {
      throw new AppError('Investor not found', 404);
    }

    const capitalCalls = await prisma.capitalCallDetail.findMany({
      where: {
        investorId: id,
      },
      include: {
        capitalCall: {
          include: {
            fund: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return capitalCalls;
  }

  async getInvestorDistributions(id: string) {
    const investor = await prisma.investor.findUnique({
      where: { id },
    });

    if (!investor || investor.deletedAt) {
      throw new AppError('Investor not found', 404);
    }

    const distributions = await prisma.distributionDetail.findMany({
      where: {
        investorId: id,
      },
      include: {
        distribution: {
          include: {
            fund: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return distributions;
  }
}
