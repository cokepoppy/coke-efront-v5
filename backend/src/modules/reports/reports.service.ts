import prisma from '../../database/prisma';
import { AppError } from '../../shared/middleware/error.middleware';

export class ReportsService {
  // Fund Performance Report
  async getFundPerformanceReport(fundId: string, startDate?: string, endDate?: string) {
    const fund = await prisma.fund.findUnique({
      where: { id: fundId },
      include: {
        investments: {
          where: {
            deletedAt: null,
          },
          include: {
            valuations: {
              orderBy: { valuationDate: 'desc' },
              take: 1,
            },
          },
        },
        transactions: {
          where: {
            deletedAt: null,
            ...(startDate && endDate
              ? {
                  transactionDate: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                  },
                }
              : {}),
          },
          orderBy: { transactionDate: 'desc' },
        },
        distributions: {
          where: {
            deletedAt: null,
            ...(startDate && endDate
              ? {
                  distributionDate: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                  },
                }
              : {}),
          },
          orderBy: { distributionDate: 'desc' },
        },
      },
    });

    if (!fund) {
      throw new AppError(404, 'FUND_NOT_FOUND', 'Fund not found');
    }

    // Calculate metrics
    const totalInvested = fund.investments.reduce(
      (sum, inv) => sum + Number(inv.initialInvestment),
      0
    );

    const currentValue = fund.investments.reduce((sum, inv) => {
      const latestValuation = inv.valuations[0];
      return sum + (latestValuation ? Number(latestValuation.fairValue) : Number(inv.initialInvestment));
    }, 0);

    const totalDistributions = fund.distributions.reduce(
      (sum, dist) => sum + Number(dist.totalAmount),
      0
    );

    const unrealizedGain = currentValue - totalInvested;
    const realizedGain = totalDistributions;
    const totalReturn = unrealizedGain + realizedGain;
    const irr = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
    const moic = totalInvested > 0 ? (currentValue + totalDistributions) / totalInvested : 0;

    return {
      fund: {
        id: fund.id,
        name: fund.name,
        type: fund.fundType,
        status: fund.status,
        totalSize: Number(fund.totalSize),
        currency: fund.currency,
        vintage: fund.vintageYear,
      },
      metrics: {
        totalInvested,
        currentValue,
        totalDistributions,
        unrealizedGain,
        realizedGain,
        totalReturn,
        irr: Number(irr.toFixed(2)),
        moic: Number(moic.toFixed(2)),
      },
      transactions: fund.transactions.map((txn) => ({
        ...txn,
        amount: Number(txn.amount),
      })),
      distributions: fund.distributions.map((dist) => ({
        ...dist,
        totalAmount: Number(dist.totalAmount),
        paidAmount: Number(dist.paidAmount),
      })),
      investments: fund.investments.map((inv) => ({
        ...inv,
        investmentAmount: Number(inv.initialInvestment),
        currentValue: inv.valuations[0] ? Number(inv.valuations[0].fairValue) : Number(inv.initialInvestment),
        ownershipPercentage: Number(inv.ownershipPercentage),
      })),
    };
  }

  // Investment Performance Report
  async getInvestmentPerformanceReport(investmentId: string) {
    const investment = await prisma.investment.findUnique({
      where: { id: investmentId },
      include: {
        fund: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
        valuations: {
          orderBy: { valuationDate: 'desc' },
        },
        distributions: {
          where: { deletedAt: null },
          orderBy: { distributionDate: 'desc' },
        },
      },
    });

    if (!investment) {
      throw new AppError(404, 'INVESTMENT_NOT_FOUND', 'Investment not found');
    }

    const latestValuation = investment.valuations[0];
    const currentValue = latestValuation
      ? Number(latestValuation.fairValue)
      : Number(investment.initialInvestment);

    // Note: Distributions are at fund level, not investment level
    const totalDistributions = 0;

    const investmentAmount = Number(investment.initialInvestment);
    const unrealizedGain = currentValue - investmentAmount;
    const realizedGain = totalDistributions;
    const totalReturn = unrealizedGain + realizedGain;
    const returnMultiple = investmentAmount > 0 ? (currentValue + totalDistributions) / investmentAmount : 0;

    return {
      investment: {
        id: investment.id,
        investmentDate: investment.investmentDate,
        investmentAmount,
        ownershipPercentage: Number(investment.ownershipPercentage),
        status: investment.status,
        fund: investment.fund,
        companyName: investment.companyName,
        industry: investment.industry,
        sector: investment.sector,
      },
      metrics: {
        currentValue,
        totalDistributions,
        unrealizedGain,
        realizedGain,
        totalReturn,
        returnMultiple: Number(returnMultiple.toFixed(2)),
        holdingPeriod: Math.floor(
          (new Date().getTime() - new Date(investment.investmentDate).getTime()) / (1000 * 60 * 60 * 24)
        ),
      },
      valuations: investment.valuations.map((val) => ({
        ...val,
        fairValue: Number(val.fairValue),
        multiple: val.multiple ? Number(val.multiple) : null,
      })),
    };
  }

  // Investor Statement Report
  async getInvestorStatementReport(
    investorId: string,
    fundId?: string,
    startDate?: string,
    endDate?: string
  ) {
    const investor = await prisma.investor.findUnique({
      where: { id: investorId },
      include: {
        fundInvestors: {
          where: {
            deletedAt: null,
            ...(fundId ? { fundId } : {}),
          },
          include: {
            fund: {
              select: {
                id: true,
                name: true,
                currency: true,
              },
            },
            capitalCallDetails: {
              where: {
                deletedAt: null,
              },
              include: {
                capitalCall: {
                  where: {
                    deletedAt: null,
                    ...(startDate && endDate
                      ? {
                          callDate: {
                            gte: new Date(startDate),
                            lte: new Date(endDate),
                          },
                        }
                      : {}),
                  },
                },
              },
              orderBy: {
                capitalCall: {
                  callDate: 'desc',
                },
              },
            },
            distributionDetails: {
              where: {
                deletedAt: null,
              },
              include: {
                distribution: {
                  where: {
                    deletedAt: null,
                    ...(startDate && endDate
                      ? {
                          distributionDate: {
                            gte: new Date(startDate),
                            lte: new Date(endDate),
                          },
                        }
                      : {}),
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!investor) {
      throw new AppError(404, 'INVESTOR_NOT_FOUND', 'Investor not found');
    }

    const commitments = investor.fundInvestors.map((fundInvestor) => {
      const totalCommitment = Number(fundInvestor.commitmentAmount);
      const totalCalled = Number(fundInvestor.calledAmount);
      const totalDistributed = Number(fundInvestor.distributedAmount);
      const unfundedCommitment = totalCommitment - totalCalled;

      return {
        id: fundInvestor.id,
        fund: fundInvestor.fund,
        commitmentAmount: totalCommitment,
        calledAmount: totalCalled,
        distributedAmount: totalDistributed,
        unfundedCommitment,
        commitmentDate: fundInvestor.commitmentDate,
        capitalCalls: fundInvestor.capitalCallDetails
          .filter((detail) => detail.capitalCall)
          .map((detail) => ({
            id: detail.id,
            capitalCallId: detail.capitalCallId,
            callDate: detail.capitalCall.callDate,
            callAmount: Number(detail.amount),
            paidAmount: Number(detail.amount),
            status: detail.capitalCall.status,
          })),
        distributions: fundInvestor.distributionDetails
          .filter((detail) => detail.distribution)
          .map((detail) => ({
            id: detail.id,
            distributionId: detail.distributionId,
            distributionDate: detail.distribution.distributionDate,
            amount: Number(detail.amount),
            type: detail.distribution.distributionType,
            status: detail.distribution.status,
          })),
      };
    });

    const totalCommitment = commitments.reduce((sum, c) => sum + c.commitmentAmount, 0);
    const totalCalled = commitments.reduce((sum, c) => sum + c.calledAmount, 0);
    const totalDistributed = commitments.reduce((sum, c) => sum + c.distributedAmount, 0);
    const totalUnfunded = commitments.reduce((sum, c) => sum + c.unfundedCommitment, 0);

    return {
      investor: {
        id: investor.id,
        name: investor.name,
        type: investor.type,
        email: investor.email,
        country: investor.country,
      },
      summary: {
        totalCommitment,
        totalCalled,
        totalDistributed,
        totalUnfunded,
        netInvested: totalCalled - totalDistributed,
      },
      commitments,
    };
  }

  // Fund Performance List
  async getFundPerformancesList(params?: {
    fundId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const funds = await prisma.fund.findMany({
      where: {
        deletedAt: null,
        ...(params?.fundId ? { id: params.fundId } : {}),
      },
      include: {
        metrics: {
          orderBy: { asOfDate: 'desc' },
          take: 1,
        },
        investments: {
          where: { deletedAt: null },
          include: {
            valuations: {
              orderBy: { valuationDate: 'desc' },
              take: 1,
            },
          },
        },
        distributions: {
          ...(params?.startDate && params?.endDate
            ? {
                where: {
                  distributionDate: {
                    gte: new Date(params.startDate),
                    lte: new Date(params.endDate),
                  },
                },
              }
            : {}),
        },
      },
    });

    return funds.map((fund) => {
      const totalInvested = fund.investments.reduce(
        (sum, inv) => sum + Number(inv.initialInvestment),
        0
      );

      const currentValue = fund.investments.reduce((sum, inv) => {
        const latestValuation = inv.valuations[0];
        return sum + (latestValuation ? Number(latestValuation.fairValue) : Number(inv.initialInvestment));
      }, 0);

      const totalDistributions = fund.distributions.reduce(
        (sum, dist) => sum + Number(dist.totalAmount),
        0
      );

      const metric = fund.metrics[0];

      return {
        id: fund.id,
        fundId: fund.id,
        fundName: fund.name,
        currency: fund.currency,
        vintageYear: fund.vintageYear,
        totalCommitments: Number(fund.totalSize),
        totalCalled: metric ? Number(metric.calledCapital) : totalInvested,
        totalDistributed: totalDistributions,
        totalValue: currentValue + totalDistributions,
        netAssetValue: currentValue,
        unrealizedValue: currentValue - totalInvested,
        realizedValue: totalDistributions,
        irr: metric ? Number(metric.irr) : totalInvested > 0 ? ((currentValue + totalDistributions - totalInvested) / totalInvested) * 100 : 0,
        tvpi: metric ? Number(metric.tvpi) : totalInvested > 0 ? (currentValue + totalDistributions) / totalInvested : 0,
        dpi: metric ? Number(metric.dpi) : totalInvested > 0 ? totalDistributions / totalInvested : 0,
        rvpi: metric ? Number(metric.rvpi) : totalInvested > 0 ? currentValue / totalInvested : 0,
        moic: metric ? Number(metric.moic) : totalInvested > 0 ? (currentValue + totalDistributions) / totalInvested : 0,
        managementFees: Number(fund.managementFeeRate || 0) * Number(fund.totalSize),
        performanceFees: 0,
        expenses: 0,
        calculatedAt: new Date().toISOString(),
      };
    });
  }

  // Investment Performance List
  async getInvestmentPerformancesList(params?: {
    fundId?: string;
    investmentId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const investments = await prisma.investment.findMany({
      where: {
        deletedAt: null,
        ...(params?.fundId ? { fundId: params.fundId } : {}),
        ...(params?.investmentId ? { id: params.investmentId } : {}),
        ...(params?.status ? { status: params.status as any } : {}),
        ...(params?.startDate && params?.endDate
          ? {
              investmentDate: {
                gte: new Date(params.startDate),
                lte: new Date(params.endDate),
              },
            }
          : {}),
      },
      include: {
        fund: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
        valuations: {
          orderBy: { valuationDate: 'desc' },
          take: 1,
        },
      },
    });

    // Get fund distributions for each investment's fund
    const fundIds = [...new Set(investments.map(inv => inv.fundId))];
    const fundDistributions = await prisma.distribution.findMany({
      where: {
        fundId: { in: fundIds },
      },
      select: {
        fundId: true,
        totalAmount: true,
      },
    });

    const distributionsByFund = fundDistributions.reduce((acc, dist) => {
      if (!acc[dist.fundId]) acc[dist.fundId] = 0;
      acc[dist.fundId] += Number(dist.totalAmount);
      return acc;
    }, {} as Record<string, number>);

    return investments.map((investment) => {
      const latestValuation = investment.valuations[0];
      const currentValue = latestValuation
        ? Number(latestValuation.fairValue)
        : Number(investment.initialInvestment);

      // Approximate distributions for this investment (pro-rata based on investment size)
      const fundTotalDist = distributionsByFund[investment.fundId] || 0;
      const totalDistributions = 0; // Distributions are at fund level, not investment level

      const investmentAmount = Number(investment.initialInvestment);
      const unrealizedGain = currentValue - investmentAmount;
      const realizedGain = totalDistributions;
      const holdingPeriod = Math.floor(
        (new Date().getTime() - new Date(investment.investmentDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
      );

      return {
        id: investment.id,
        investmentId: investment.id,
        companyName: investment.companyName,
        fundId: investment.fundId,
        fundName: investment.fund.name,
        currency: investment.fund.currency,
        sector: investment.sector,
        investmentDate: investment.investmentDate.toISOString(),
        exitDate: investment.exitDate?.toISOString(),
        initialInvestment: investmentAmount,
        additionalInvestments: 0,
        totalInvested: investmentAmount,
        distributions: totalDistributions,
        currentValue,
        totalValue: currentValue + totalDistributions,
        realizedGain,
        unrealizedGain,
        irr: investmentAmount > 0 && holdingPeriod > 0 ? ((currentValue + totalDistributions - investmentAmount) / investmentAmount) * 100 / (holdingPeriod / 12) : 0,
        moic: investmentAmount > 0 ? (currentValue + totalDistributions) / investmentAmount : 0,
        holdingPeriod,
        status: investment.status as 'active' | 'exited' | 'written-off',
        calculatedAt: new Date().toISOString(),
      };
    });
  }

  // Performance Summary
  async getPerformanceSummary(params?: {
    fundId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const whereClause = {
      deletedAt: null,
      ...(params?.fundId ? { fundId: params.fundId } : {}),
    };

    const [funds, investments] = await Promise.all([
      prisma.fund.findMany({
        where: {
          deletedAt: null,
          ...(params?.fundId ? { id: params.fundId } : {}),
        },
        include: {
          metrics: {
            orderBy: { asOfDate: 'desc' },
            take: 1,
          },
          distributions: true,
        },
      }),
      prisma.investment.findMany({
        where: whereClause,
        include: {
          valuations: {
            orderBy: { valuationDate: 'desc' },
            take: 1,
          },
        },
      }),
    ]);

    const totalCommitments = funds.reduce((sum, fund) => sum + Number(fund.totalSize), 0);
    const totalCalled = funds.reduce((sum, fund) => {
      const metric = fund.metrics[0];
      return sum + (metric ? Number(metric.calledCapital) : 0);
    }, 0);

    const totalInvested = investments.reduce(
      (sum, inv) => sum + Number(inv.initialInvestment),
      0
    );

    const totalValue = investments.reduce((sum, inv) => {
      const latestValuation = inv.valuations[0];
      return sum + (latestValuation ? Number(latestValuation.fairValue) : Number(inv.initialInvestment));
    }, 0);

    const totalDistributed = funds.reduce((sum, fund) => {
      return sum + fund.distributions.reduce((distSum, dist) => distSum + Number(dist.totalAmount), 0);
    }, 0);

    const avgIRR = funds.reduce((sum, fund) => {
      const metric = fund.metrics[0];
      return sum + (metric ? Number(metric.irr) : 0);
    }, 0) / (funds.length || 1);

    const avgTVPI = funds.reduce((sum, fund) => {
      const metric = fund.metrics[0];
      return sum + (metric ? Number(metric.tvpi) : 0);
    }, 0) / (funds.length || 1);

    const avgDPI = funds.reduce((sum, fund) => {
      const metric = fund.metrics[0];
      return sum + (metric ? Number(metric.dpi) : 0);
    }, 0) / (funds.length || 1);

    const avgRVPI = funds.reduce((sum, fund) => {
      const metric = fund.metrics[0];
      return sum + (metric ? Number(metric.rvpi) : 0);
    }, 0) / (funds.length || 1);

    return {
      totalFunds: funds.length,
      totalInvestments: investments.length,
      totalCommitments,
      totalCalled: totalCalled || totalInvested,
      totalDistributed,
      totalNetAssetValue: totalValue,
      averageIRR: Number(avgIRR.toFixed(2)),
      averageTVPI: Number(avgTVPI.toFixed(2)),
      averageDPI: Number(avgDPI.toFixed(2)),
      averageRVPI: Number(avgRVPI.toFixed(2)),
      currency: 'USD',
    };
  }

  // Portfolio Summary Report
  async getPortfolioSummaryReport() {
    const [funds, investments, totalAUM] = await Promise.all([
      prisma.fund.findMany({
        where: { deletedAt: null },
        include: {
          investments: {
            where: { deletedAt: null },
            include: {
              valuations: {
                orderBy: { valuationDate: 'desc' },
                take: 1,
              },
            },
          },
        },
      }),
      prisma.investment.findMany({
        where: { deletedAt: null },
        include: {
          fund: {
            select: { name: true, currency: true },
          },
          valuations: {
            orderBy: { valuationDate: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.fund.aggregate({
        where: { deletedAt: null },
        _sum: { totalSize: true },
      }),
    ]);

    const totalInvested = investments.reduce(
      (sum, inv) => sum + Number(inv.initialInvestment),
      0
    );

    const totalValue = investments.reduce((sum, inv) => {
      const latestValuation = inv.valuations[0];
      return sum + (latestValuation ? Number(latestValuation.fairValue) : Number(inv.initialInvestment));
    }, 0);

    const byStatus = investments.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySector = investments.reduce((acc, inv) => {
      const sector = inv.sector || 'Unknown';
      acc[sector] = (acc[sector] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      summary: {
        totalAUM: Number(totalAUM._sum.totalSize || 0),
        totalFunds: funds.length,
        totalInvestments: investments.length,
        totalInvested,
        totalValue,
        unrealizedGain: totalValue - totalInvested,
      },
      byStatus,
      bySector,
      funds: funds.map((fund) => ({
        id: fund.id,
        name: fund.name,
        type: fund.fundType,
        status: fund.status,
        totalSize: Number(fund.totalSize),
        investmentCount: fund.investments.length,
      })),
    };
  }

  // Investor Reports
  async getInvestorReports(params?: {
    page?: number;
    pageSize?: number;
    investorId?: string;
    fundId?: string;
    reportType?: string;
    year?: number;
    status?: string;
    search?: string;
  }) {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params?.investorId) where.investorId = params.investorId;
    if (params?.fundId) where.fundId = params.fundId;
    if (params?.reportType) where.reportType = params.reportType;
    if (params?.year) where.year = params.year;
    if (params?.status) where.status = params.status;

    if (params?.search) {
      where.OR = [
        { investor: { name: { contains: params.search } } },
        { fund: { name: { contains: params.search } } },
      ];
    }

    const [reports, total] = await Promise.all([
      prisma.investorReport.findMany({
        where,
        include: {
          investor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          fund: {
            select: {
              id: true,
              name: true,
              currency: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.investorReport.count({ where }),
    ]);

    return {
      data: reports,
      total,
      page,
      pageSize,
    };
  }

  async getInvestorReportById(id: string) {
    const report = await prisma.investorReport.findUnique({
      where: { id },
      include: {
        investor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        fund: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
    });

    if (!report) {
      throw new AppError(404, 'REPORT_NOT_FOUND', 'Investor report not found');
    }

    return report;
  }

  async createInvestorReport(data: {
    investorId: string;
    fundId: string;
    reportType: string;
    year: number;
    quarter?: number;
    reportDate: string;
    notes?: string;
  }) {
    const report = await prisma.investorReport.create({
      data: {
        investorId: data.investorId,
        fundId: data.fundId,
        reportType: data.reportType as any,
        year: data.year,
        quarter: data.quarter,
        reportDate: new Date(data.reportDate),
        notes: data.notes,
        status: 'draft',
      },
      include: {
        investor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        fund: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
    });

    return report;
  }

  async generateInvestorReport(id: string) {
    const report = await prisma.investorReport.findUnique({
      where: { id },
    });

    if (!report) {
      throw new AppError(404, 'REPORT_NOT_FOUND', 'Investor report not found');
    }

    // TODO: Generate PDF report
    const updatedReport = await prisma.investorReport.update({
      where: { id },
      data: {
        status: 'generated',
        generatedAt: new Date(),
      },
      include: {
        investor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        fund: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
    });

    return updatedReport;
  }

  async sendInvestorReport(id: string) {
    const report = await prisma.investorReport.findUnique({
      where: { id },
    });

    if (!report) {
      throw new AppError(404, 'REPORT_NOT_FOUND', 'Investor report not found');
    }

    if (report.status !== 'generated') {
      throw new AppError(400, 'INVALID_STATUS', 'Report must be generated before sending');
    }

    // TODO: Send email with report
    const updatedReport = await prisma.investorReport.update({
      where: { id },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
      include: {
        investor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        fund: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
    });

    return updatedReport;
  }

  async updateInvestorReport(id: string, data: any) {
    const report = await prisma.investorReport.update({
      where: { id },
      data: {
        ...data,
        reportDate: data.reportDate ? new Date(data.reportDate) : undefined,
      },
      include: {
        investor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        fund: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
    });

    return report;
  }

  async deleteInvestorReport(id: string) {
    await prisma.investorReport.delete({
      where: { id },
    });
  }
}

export const reportsService = new ReportsService();
