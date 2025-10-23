import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface CapitalCallDetail {
  id: string;
  capitalCallId: string;
  investorId: string;
  calledAmount: number;
  receivedAmount: number;
  receivedDate?: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  paymentReference?: string;
  notes?: string;
  investor?: {
    id: string;
    name: string;
    email?: string;
    investorType?: string;
  };
}

export interface CapitalCall {
  id: string;
  fundId: string;
  callNumber: number;
  callDate: string;
  dueDate: string;
  purpose?: string;
  totalAmount: number;
  receivedAmount: number;
  status: 'draft' | 'sent' | 'partial' | 'complete' | 'overdue';
  bankAccount?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  fund?: {
    id: string;
    name: string;
    currency: string;
  };
  details?: CapitalCallDetail[];
  _count?: {
    details?: number;
  };
}

interface CapitalCallsState {
  capitalCalls: CapitalCall[];
  currentCapitalCall: CapitalCall | null;
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

const initialState: CapitalCallsState = {
  capitalCalls: [],
  currentCapitalCall: null,
  total: 0,
  page: 1,
  pageSize: 10,
  loading: false,
  error: null,
};

// Async thunks
export const fetchCapitalCalls = createAsyncThunk(
  'capitalCalls/fetchCapitalCalls',
  async (params?: {
    page?: number;
    pageSize?: number;
    fundId?: string;
    status?: string;
    search?: string;
  }) => {
    const response = await api.get('/capital-calls', { params });
    return response.data;
  }
);

export const fetchCapitalCallById = createAsyncThunk(
  'capitalCalls/fetchCapitalCallById',
  async (id: string) => {
    const response = await api.get(`/capital-calls/${id}`);
    return response.data;
  }
);

export const createCapitalCall = createAsyncThunk(
  'capitalCalls/createCapitalCall',
  async (data: {
    fundId: string;
    callNumber: number;
    callDate: string;
    dueDate: string;
    purpose?: string;
    totalAmount: number;
    bankAccount?: string;
    notes?: string;
    details: Array<{
      investorId: string;
      calledAmount: number;
    }>;
  }) => {
    const response = await api.post('/capital-calls', data);
    return response.data;
  }
);

export const updateCapitalCall = createAsyncThunk(
  'capitalCalls/updateCapitalCall',
  async ({ id, data }: { id: string; data: Partial<CapitalCall> }) => {
    const response = await api.put(`/capital-calls/${id}`, data);
    return response.data;
  }
);

export const deleteCapitalCall = createAsyncThunk(
  'capitalCalls/deleteCapitalCall',
  async (id: string) => {
    await api.delete(`/capital-calls/${id}`);
    return id;
  }
);

export const updateCapitalCallDetail = createAsyncThunk(
  'capitalCalls/updateCapitalCallDetail',
  async ({
    detailId,
    data,
  }: {
    detailId: string;
    data: {
      receivedAmount?: number;
      receivedDate?: string;
      status?: string;
      paymentReference?: string;
      notes?: string;
    };
  }) => {
    const response = await api.put(`/capital-calls/details/${detailId}`, data);
    return response.data;
  }
);

export const fetchCapitalCallsByFund = createAsyncThunk(
  'capitalCalls/fetchCapitalCallsByFund',
  async (fundId: string) => {
    const response = await api.get(`/capital-calls/fund/${fundId}`);
    return response.data;
  }
);

// Slice
const capitalCallsSlice = createSlice({
  name: 'capitalCalls',
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
    clearCurrentCapitalCall: (state) => {
      state.currentCapitalCall = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch capital calls
    builder
      .addCase(fetchCapitalCalls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCapitalCalls.fulfilled, (state, action) => {
        state.loading = false;
        state.capitalCalls = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchCapitalCalls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch capital calls';
      });

    // Fetch capital call by ID
    builder
      .addCase(fetchCapitalCallById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCapitalCallById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCapitalCall = action.payload;
      })
      .addCase(fetchCapitalCallById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch capital call';
      });

    // Create capital call
    builder
      .addCase(createCapitalCall.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCapitalCall.fulfilled, (state, action) => {
        state.loading = false;
        state.capitalCalls.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createCapitalCall.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create capital call';
      });

    // Update capital call
    builder
      .addCase(updateCapitalCall.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCapitalCall.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.capitalCalls.findIndex((cc) => cc.id === action.payload.id);
        if (index !== -1) {
          state.capitalCalls[index] = action.payload;
        }
        if (state.currentCapitalCall?.id === action.payload.id) {
          state.currentCapitalCall = action.payload;
        }
      })
      .addCase(updateCapitalCall.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update capital call';
      });

    // Delete capital call
    builder
      .addCase(deleteCapitalCall.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCapitalCall.fulfilled, (state, action) => {
        state.loading = false;
        state.capitalCalls = state.capitalCalls.filter((cc) => cc.id !== action.payload);
        state.total -= 1;
      })
      .addCase(deleteCapitalCall.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete capital call';
      });

    // Update capital call detail
    builder
      .addCase(updateCapitalCallDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCapitalCallDetail.fulfilled, (state, action) => {
        state.loading = false;
        // Update the detail in current capital call
        if (state.currentCapitalCall?.details) {
          const detailIndex = state.currentCapitalCall.details.findIndex(
            (d) => d.id === action.payload.id
          );
          if (detailIndex !== -1) {
            state.currentCapitalCall.details[detailIndex] = action.payload;
          }
        }
      })
      .addCase(updateCapitalCallDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update capital call detail';
      });

    // Fetch capital calls by fund
    builder
      .addCase(fetchCapitalCallsByFund.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCapitalCallsByFund.fulfilled, (state, action) => {
        state.loading = false;
        state.capitalCalls = action.payload;
        state.total = action.payload.length;
      })
      .addCase(fetchCapitalCallsByFund.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch capital calls by fund';
      });
  },
});

export const { setPage, setPageSize, clearError, clearCurrentCapitalCall } =
  capitalCallsSlice.actions;
export default capitalCallsSlice.reducer;
