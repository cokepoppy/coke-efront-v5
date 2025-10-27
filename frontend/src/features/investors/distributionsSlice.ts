import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface DistributionDetail {
  id: string;
  distributionId: string;
  investorId: string;
  distributionAmount: number;
  paidAmount: number;
  paymentDate?: string;
  status: 'pending' | 'paid';
  paymentReference?: string;
  withholdingTax: number;
  netAmount?: number;
  notes?: string;
  investor?: {
    id: string;
    name: string;
    email?: string;
    investorType?: string;
  };
}

export interface Distribution {
  id: string;
  fundId: string;
  distributionNumber: number;
  distributionDate: string;
  paymentDate: string;
  distributionType: 'income' | 'capitalGain' | 'returnOfCapital';
  totalAmount: number;
  paidAmount: number;
  status: 'draft' | 'approved' | 'processing' | 'complete';
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  fund?: {
    id: string;
    name: string;
    currency: string;
  };
  details?: DistributionDetail[];
  _count?: {
    details?: number;
  };
}

interface DistributionsState {
  distributions: Distribution[];
  currentDistribution: Distribution | null;
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

const initialState: DistributionsState = {
  distributions: [],
  currentDistribution: null,
  total: 0,
  page: 1,
  pageSize: 10,
  loading: false,
  error: null,
};

// Async thunks
export const fetchDistributions = createAsyncThunk(
  'distributions/fetchDistributions',
  async (params?: {
    page?: number;
    pageSize?: number;
    fundId?: string;
    status?: string;
    search?: string;
  }) => {
    const response = await api.get('/distributions', { params });
    return response.data;
  }
);

export const fetchDistributionById = createAsyncThunk(
  'distributions/fetchDistributionById',
  async (id: string) => {
    const response = await api.get(`/distributions/${id}`);
    return response.data;
  }
);

export const createDistribution = createAsyncThunk(
  'distributions/createDistribution',
  async (data: {
    fundId: string;
    distributionNumber: number;
    distributionDate: string;
    paymentDate: string;
    distributionType: string;
    totalAmount: number;
    notes?: string;
    details: Array<{
      investorId: string;
      distributionAmount: number;
      withholdingTax?: number;
    }>;
  }) => {
    const response = await api.post('/distributions', data);
    return response.data;
  }
);

export const updateDistribution = createAsyncThunk(
  'distributions/updateDistribution',
  async ({ id, data }: { id: string; data: Partial<Distribution> }) => {
    const response = await api.put(`/distributions/${id}`, data);
    return response.data;
  }
);

export const deleteDistribution = createAsyncThunk(
  'distributions/deleteDistribution',
  async (id: string) => {
    await api.delete(`/distributions/${id}`);
    return id;
  }
);

export const updateDistributionDetail = createAsyncThunk(
  'distributions/updateDistributionDetail',
  async ({
    detailId,
    data,
  }: {
    detailId: string;
    data: {
      paidAmount?: number;
      paymentDate?: string;
      status?: string;
      paymentReference?: string;
      notes?: string;
    };
  }) => {
    const response = await api.put(`/distributions/details/${detailId}`, data);
    return response.data;
  }
);

export const fetchDistributionsByFund = createAsyncThunk(
  'distributions/fetchDistributionsByFund',
  async (fundId: string) => {
    const response = await api.get(`/distributions/fund/${fundId}`);
    return response.data;
  }
);

// Slice
const distributionsSlice = createSlice({
  name: 'distributions',
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
    clearCurrentDistribution: (state) => {
      state.currentDistribution = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch distributions
    builder
      .addCase(fetchDistributions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDistributions.fulfilled, (state, action) => {
        state.loading = false;
        state.distributions = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchDistributions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch distributions';
      });

    // Fetch distribution by ID
    builder
      .addCase(fetchDistributionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDistributionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDistribution = action.payload;
      })
      .addCase(fetchDistributionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch distribution';
      });

    // Create distribution
    builder
      .addCase(createDistribution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDistribution.fulfilled, (state, action) => {
        state.loading = false;
        state.distributions.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createDistribution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create distribution';
      });

    // Update distribution
    builder
      .addCase(updateDistribution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDistribution.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.distributions.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) {
          state.distributions[index] = action.payload;
        }
        if (state.currentDistribution?.id === action.payload.id) {
          state.currentDistribution = action.payload;
        }
      })
      .addCase(updateDistribution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update distribution';
      });

    // Delete distribution
    builder
      .addCase(deleteDistribution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDistribution.fulfilled, (state, action) => {
        state.loading = false;
        state.distributions = state.distributions.filter((d) => d.id !== action.payload);
        state.total -= 1;
      })
      .addCase(deleteDistribution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete distribution';
      });

    // Update distribution detail
    builder
      .addCase(updateDistributionDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDistributionDetail.fulfilled, (state, action) => {
        state.loading = false;
        // Update the detail in current distribution
        if (state.currentDistribution?.details) {
          const detailIndex = state.currentDistribution.details.findIndex(
            (d) => d.id === action.payload.id
          );
          if (detailIndex !== -1) {
            state.currentDistribution.details[detailIndex] = action.payload;
          }
        }
      })
      .addCase(updateDistributionDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update distribution detail';
      });

    // Fetch distributions by fund
    builder
      .addCase(fetchDistributionsByFund.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDistributionsByFund.fulfilled, (state, action) => {
        state.loading = false;
        state.distributions = action.payload;
        state.total = action.payload.length;
      })
      .addCase(fetchDistributionsByFund.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch distributions by fund';
      });
  },
});

export const { setPage, setPageSize, clearError, clearCurrentDistribution } =
  distributionsSlice.actions;
export default distributionsSlice.reducer;
