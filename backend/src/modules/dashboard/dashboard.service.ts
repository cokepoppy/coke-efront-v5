import { prisma } from '../../shared/utils/prisma.client';

export class DashboardService {
  async getStatistics() {
    const [
      fundsCount,
      investmentsCount,
      investorsCount,
      totalAUM,
      recentFunds,
      recentInvestments,
      upcomingEvents,
    ] = await Promise.all([
      // 基金数量
      prisma.fund.count({
        where: { deletedAt: null },
      }),
      // 投资项目数量
      prisma.investment.count({
        where: { deletedAt: null },
      }),
      // 投资者数量
      prisma.investor.count({
        where: { deletedAt: null },
      }),
      // 总资产规模 (所有基金的 totalSize 之和)
      prisma.fund.aggregate({
        where: { deletedAt: null },
        _sum: {
          totalSize: true,
        },
      }),
      // 最近创建的基金
      prisma.fund.findMany({
        where: { deletedAt: null },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          fundType: true,
          totalSize: true,
          currency: true,
          status: true,
          createdAt: true,
        },
      }),
      // 最近的投资项目
      prisma.investment.findMany({
        where: { deletedAt: null },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          companyName: true,
          initialInvestment: true,
          investmentDate: true,
          status: true,
          fund: {
            select: {
              name: true,
            },
          },
        },
      }),
      // 即将到来的事件
      prisma.event.findMany({
        where: {
          deletedAt: null,
          startDate: {
            gte: new Date(),
          },
        },
        take: 5,
        orderBy: { startDate: 'asc' },
        select: {
          id: true,
          title: true,
          startDate: true,
          eventType: true,
          location: true,
        },
      }),
    ]);

    return {
      statistics: {
        fundsCount,
        investmentsCount,
        investorsCount,
        totalAUM: totalAUM._sum.totalSize || 0,
      },
      recentFunds,
      recentInvestments,
      upcomingEvents,
    };
  }

  async getFundPerformance() {
    const funds = await prisma.fund.findMany({
      where: { deletedAt: null },
      include: {
        fundMetrics: {
          orderBy: { asOfDate: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            investments: true,
            fundInvestors: true,
          },
        },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    return funds.map((fund) => ({
      id: fund.id,
      name: fund.name,
      fundType: fund.fundType,
      totalSize: fund.totalSize,
      currency: fund.currency,
      status: fund.status,
      investmentsCount: fund._count.investments,
      investorsCount: fund._count.fundInvestors,
      metrics: fund.fundMetrics[0] || null,
    }));
  }

  async getInvestmentsByStatus() {
    const investments = await prisma.investment.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: true,
    });

    return investments.map((item) => ({
      status: item.status,
      count: item._count,
    }));
  }

  async getInvestmentsBySector() {
    const investments = await prisma.investment.groupBy({
      by: ['sector'],
      where: {
        deletedAt: null,
        sector: { not: null },
      },
      _count: true,
    });

    return investments.map((item) => ({
      sector: item.sector,
      count: item._count,
    }));
  }
}

export const dashboardService = new DashboardService();
