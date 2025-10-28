import prisma from '../../database/prisma';
import { AppError } from '../../shared/middleware/error.middleware';

export class TransactionsService {
  async getTransactions(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    fundId?: string;
    transactionType?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const {
      page = 1,
      pageSize = 20,
      search,
      fundId,
      transactionType,
      startDate,
      endDate,
    } = params;

    const where: any = {};

    if (search) {
      where.OR = [
        { description: { contains: search } },
        { referenceId: { contains: search } },
        { fund: { name: { contains: search } } },
      ];
    }

    if (fundId) {
      where.fundId = fundId;
    }

    if (transactionType) {
      where.transactionType = transactionType;
    }

    if (startDate && endDate) {
      where.transactionDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.transactionDate = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      where.transactionDate = {
        lte: new Date(endDate),
      };
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { transactionDate: 'desc' },
        include: {
          fund: {
            select: {
              id: true,
              name: true,
              currency: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    // Convert Decimal to Number
    const serializedTransactions = transactions.map((txn) => ({
      ...txn,
      amount: Number(txn.amount),
    }));

    return {
      data: serializedTransactions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getTransactionById(id: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        fund: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new AppError(404, 'TRANSACTION_NOT_FOUND', 'Transaction not found');
    }

    // Convert Decimal to Number
    return {
      ...transaction,
      amount: Number(transaction.amount),
    };
  }

  async createTransaction(data: {
    fundId: string;
    transactionDate: Date;
    transactionType: string;
    amount: number;
    currency?: string;
    description?: string;
    referenceId?: string;
    referenceType?: string;
    settlementDate?: Date;
    status?: string;
    createdBy?: string;
  }) {
    const transaction = await prisma.transaction.create({
      data: {
        fundId: data.fundId,
        transactionDate: data.transactionDate,
        transactionType: data.transactionType as any,
        amount: data.amount,
        currency: data.currency || 'USD',
        description: data.description,
        referenceId: data.referenceId,
        referenceType: data.referenceType,
        settlementDate: data.settlementDate,
        status: (data.status as any) || 'pending',
        createdBy: data.createdBy,
      },
      include: {
        fund: true,
      },
    });

    // Convert Decimal to Number
    return {
      ...transaction,
      amount: Number(transaction.amount),
    };
  }

  async updateTransaction(
    id: string,
    data: {
      transactionDate?: Date;
      amount?: number;
      description?: string;
      settlementDate?: Date;
      status?: string;
    }
  ) {
    const existing = await this.getTransactionById(id);

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        transactionDate: data.transactionDate,
        amount: data.amount,
        description: data.description,
        settlementDate: data.settlementDate,
        status: data.status as any,
      },
      include: {
        fund: true,
      },
    });

    // Convert Decimal to Number
    return {
      ...transaction,
      amount: Number(transaction.amount),
    };
  }

  async deleteTransaction(id: string) {
    const existing = await this.getTransactionById(id);

    await prisma.transaction.delete({
      where: { id },
    });

    return { message: 'Transaction deleted successfully' };
  }
}

export const transactionsService = new TransactionsService();
