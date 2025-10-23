import prisma from '../../database/prisma';
import { AppError } from '../../shared/middleware/error.middleware';
import { Prisma } from '@prisma/client';

export class CapitalCallsService {
  async getCapitalCalls(params: {
    page?: number;
    pageSize?: number;
    fundId?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      pageSize = 20,
      fundId,
      status,
      search,
      sortBy = 'callDate',
      sortOrder = 'desc',
    } = params;

    const where: Prisma.CapitalCallWhereInput = {};

    if (fundId) {
      where.fundId = fundId;
    }

    if (status) {
      where.status = status as any;
    }

    if (search) {
      where.OR = [
        { purpose: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    const [capitalCalls, total] = await Promise.all([
      prisma.capitalCall.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          fund: {
            select: {
              id: true,
              name: true,
              currency: true,
            },
          },
          details: {
            select: {
              id: true,
              investorId: true,
              calledAmount: true,
              receivedAmount: true,
              status: true,
              investor: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              details: true,
            },
          },
        },
      }),
      prisma.capitalCall.count({ where }),
    ]);

    return { capitalCalls, total, page, pageSize };
  }

  async getCapitalCallById(id: string) {
    const capitalCall = await prisma.capitalCall.findUnique({
      where: { id },
      include: {
        fund: {
          select: {
            id: true,
            name: true,
            currency: true,
            totalSize: true,
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
          orderBy: {
            investor: {
              name: 'asc',
            },
          },
        },
      },
    });

    if (!capitalCall) {
      throw new AppError('Capital call not found', 404);
    }

    return capitalCall;
  }

  async createCapitalCall(data: {
    fundId: string;
    callNumber: number;
    callDate: Date;
    dueDate: Date;
    purpose?: string;
    totalAmount: number;
    bankAccount?: string;
    notes?: string;
    createdBy?: string;
    details: Array<{
      investorId: string;
      calledAmount: number;
    }>;
  }) {
    const { details, ...capitalCallData } = data;

    // Validate fund exists
    const fund = await prisma.fund.findUnique({
      where: { id: data.fundId },
    });

    if (!fund || fund.deletedAt) {
      throw new AppError('Fund not found', 404);
    }

    // Create capital call with details
    const capitalCall = await prisma.capitalCall.create({
      data: {
        ...capitalCallData,
        details: {
          create: details.map((detail) => ({
            investorId: detail.investorId,
            calledAmount: detail.calledAmount,
            receivedAmount: 0,
            status: 'pending',
          })),
        },
      },
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
              },
            },
          },
        },
        _count: {
          select: {
            details: true,
          },
        },
      },
    });

    return capitalCall;
  }

  async updateCapitalCall(
    id: string,
    data: Prisma.CapitalCallUpdateInput
  ) {
    const capitalCall = await prisma.capitalCall.findUnique({
      where: { id },
    });

    if (!capitalCall) {
      throw new AppError('Capital call not found', 404);
    }

    const updated = await prisma.capitalCall.update({
      where: { id },
      data,
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
              },
            },
          },
        },
        _count: {
          select: {
            details: true,
          },
        },
      },
    });

    return updated;
  }

  async deleteCapitalCall(id: string) {
    const capitalCall = await prisma.capitalCall.findUnique({
      where: { id },
    });

    if (!capitalCall) {
      throw new AppError('Capital call not found', 404);
    }

    // Delete capital call and its details (cascade)
    await prisma.capitalCall.delete({
      where: { id },
    });

    return { message: 'Capital call deleted successfully' };
  }

  async updateCapitalCallDetail(
    detailId: string,
    data: {
      receivedAmount?: number;
      receivedDate?: Date;
      status?: string;
      paymentReference?: string;
      notes?: string;
    }
  ) {
    const detail = await prisma.capitalCallDetail.findUnique({
      where: { id: detailId },
    });

    if (!detail) {
      throw new AppError('Capital call detail not found', 404);
    }

    const updated = await prisma.capitalCallDetail.update({
      where: { id: detailId },
      data,
      include: {
        investor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Update parent capital call status and received amount
    await this.updateCapitalCallStatus(detail.capitalCallId);

    return updated;
  }

  private async updateCapitalCallStatus(capitalCallId: string) {
    const capitalCall = await prisma.capitalCall.findUnique({
      where: { id: capitalCallId },
      include: {
        details: true,
      },
    });

    if (!capitalCall) return;

    const totalReceived = capitalCall.details.reduce(
      (sum, detail) => sum + Number(detail.receivedAmount),
      0
    );

    const allPaid = capitalCall.details.every(
      (detail) => detail.status === 'paid'
    );
    const somePaid = capitalCall.details.some(
      (detail) => detail.receivedAmount > 0
    );
    const isOverdue = new Date() > capitalCall.dueDate && !allPaid;

    let status: string = capitalCall.status;
    if (allPaid) {
      status = 'complete';
    } else if (isOverdue) {
      status = 'overdue';
    } else if (somePaid) {
      status = 'partial';
    }

    await prisma.capitalCall.update({
      where: { id: capitalCallId },
      data: {
        receivedAmount: totalReceived,
        status: status as any,
      },
    });
  }

  async getCapitalCallsByFund(fundId: string) {
    const fund = await prisma.fund.findUnique({
      where: { id: fundId },
    });

    if (!fund || fund.deletedAt) {
      throw new AppError('Fund not found', 404);
    }

    const capitalCalls = await prisma.capitalCall.findMany({
      where: {
        fundId,
      },
      include: {
        details: {
          select: {
            id: true,
            investorId: true,
            calledAmount: true,
            receivedAmount: true,
            status: true,
          },
        },
        _count: {
          select: {
            details: true,
          },
        },
      },
      orderBy: {
        callDate: 'desc',
      },
    });

    return capitalCalls;
  }
}
