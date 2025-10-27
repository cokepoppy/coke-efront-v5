import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Transaction {
  id: string;
  fundId: string;
  transactionDate: string;
  transactionType: 'capitalCall' | 'distribution' | 'investment' | 'exit' | 'fee' | 'expense' | 'income' | 'other';
  amount: number;
  currency: string;
  description?: string;
  referenceId?: string;
  referenceType?: string;
  settlementDate?: string;
  status: 'pending' | 'settled' | 'cancelled';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  fund?: {
    id: string;
    name: string;
    currency: string;
  };
}

interface TransactionsState {
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  transactions: [],
  currentTransaction: null,
  total: 0,
  page: 1,
  pageSize: 10,
  loading: false,
  error: null,
};

// Async thunks
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params?: {
    page?: number;
    pageSize?: number;
    fundId?: string;
    transactionType?: string;
    status?: string;
    search?: string;
  }) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  }
);

export const fetchTransactionById = createAsyncThunk(
  'transactions/fetchTransactionById',
  async (id: string) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (data: {
    fundId: string;
    transactionDate: string;
    transactionType: string;
    amount: number;
    currency?: string;
    description?: string;
    referenceId?: string;
    referenceType?: string;
    settlementDate?: string;
  }) => {
    const response = await api.post('/transactions', data);
    return response.data;
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async ({ id, data }: { id: string; data: Partial<Transaction> }) => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id: string) => {
    await api.delete(`/transactions/${id}`);
    return id;
  }
);

export const fetchTransactionsByFund = createAsyncThunk(
  'transactions/fetchTransactionsByFund',
  async (fundId: string) => {
    const response = await api.get(`/transactions/fund/${fundId}`);
    return response.data;
  }
);

// Slice
const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTransaction: (state) => {
      state.currentTransaction = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch transactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      });

    // Fetch transaction by ID
    builder
      .addCase(fetchTransactionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTransaction = action.payload;
      })
      .addCase(fetchTransactionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transaction';
      });

    // Create transaction
    builder
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create transaction';
      });

    // Update transaction
    builder
      .addCase(updateTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.transactions.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
        if (state.currentTransaction?.id === action.payload.id) {
          state.currentTransaction = action.payload;
        }
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update transaction';
      });

    // Delete transaction
    builder
      .addCase(deleteTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = state.transactions.filter((t) => t.id !== action.payload);
        state.total -= 1;
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete transaction';
      });

    // Fetch transactions by fund
    builder
      .addCase(fetchTransactionsByFund.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionsByFund.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
        state.total = action.payload.length;
      })
      .addCase(fetchTransactionsByFund.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transactions by fund';
      });
  },
});

export const { setPage, setPageSize, clearError, clearCurrentTransaction } =
  transactionsSlice.actions;
export default transactionsSlice.reducer;
