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
      (sum, inv) => sum + Number(inv.investmentAmount),
      0
    );

    const currentValue = fund.investments.reduce((sum, inv) => {
      const latestValuation = inv.valuations[0];
      return sum + (latestValuation ? Number(latestValuation.totalValue) : Number(inv.investmentAmount));
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
        type: fund.type,
        status: fund.status,
        totalSize: Number(fund.totalSize),
        currency: fund.currency,
        vintage: fund.vintage,
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
        investmentAmount: Number(inv.investmentAmount),
        currentValue: inv.valuations[0] ? Number(inv.valuations[0].totalValue) : Number(inv.investmentAmount),
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
      ? Number(latestValuation.totalValue)
      : Number(investment.investmentAmount);

    const totalDistributions = investment.distributions.reduce(
      (sum, dist) => sum + Number(dist.totalAmount),
      0
    );

    const investmentAmount = Number(investment.investmentAmount);
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
        equityValue: Number(val.equityValue),
        enterpriseValue: Number(val.enterpriseValue),
        totalValue: Number(val.totalValue),
        multiple: Number(val.multiple),
      })),
      distributions: investment.distributions.map((dist) => ({
        ...dist,
        totalAmount: Number(dist.totalAmount),
        paidAmount: Number(dist.paidAmount),
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
      (sum, inv) => sum + Number(inv.investmentAmount),
      0
    );

    const totalValue = investments.reduce((sum, inv) => {
      const latestValuation = inv.valuations[0];
      return sum + (latestValuation ? Number(latestValuation.totalValue) : Number(inv.investmentAmount));
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
        type: fund.type,
        status: fund.status,
        totalSize: Number(fund.totalSize),
        investmentCount: fund.investments.length,
      })),
    };
  }
}

export const reportsService = new ReportsService();
