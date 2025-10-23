import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

interface Investment {
  id: string;
  fundId: string;
  companyName: string;
  sector?: string;
  stage?: string;
  region?: string;
  investmentDate: string;
  exitDate?: string;
  initialCost: number;
  ownershipPercentage?: number;
  status: string;
  description?: string;
  fund?: {
    id: string;
    name: string;
  };
  valuations?: any[];
}

interface InvestmentsState {
  investments: Investment[];
  currentInvestment: Investment | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: InvestmentsState = {
  investments: [],
  currentInvestment: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export const fetchInvestments = createAsyncThunk(
  'investments/fetchInvestments',
  async (params: {
    page?: number;
    limit?: number;
    fundId?: string;
    stage?: string;
    status?: string;
    search?: string;
  }) => {
    const response = await api.get('/investments', { params });
    return response.data;
  }
);

export const fetchInvestmentById = createAsyncThunk(
  'investments/fetchInvestmentById',
  async (id: string) => {
    const response = await api.get(`/investments/${id}`);
    return response.data;
  }
);

export const createInvestment = createAsyncThunk(
  'investments/createInvestment',
  async (data: any) => {
    const response = await api.post('/investments', data);
    return response.data;
  }
);

export const updateInvestment = createAsyncThunk(
  'investments/updateInvestment',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await api.put(`/investments/${id}`, data);
    return response.data;
  }
);

export const deleteInvestment = createAsyncThunk(
  'investments/deleteInvestment',
  async (id: string) => {
    await api.delete(`/investments/${id}`);
    return id;
  }
);

const investmentsSlice = createSlice({
  name: 'investments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentInvestment: (state) => {
      state.currentInvestment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch investments
      .addCase(fetchInvestments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestments.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.investments = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchInvestments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch investments';
      })
      // Fetch investment by ID
      .addCase(fetchInvestmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestmentById.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.currentInvestment = action.payload.data;
      })
      .addCase(fetchInvestmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch investment';
      })
      // Create investment
      .addCase(createInvestment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInvestment.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.investments.unshift(action.payload.data);
      })
      .addCase(createInvestment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create investment';
      })
      // Update investment
      .addCase(updateInvestment.fulfilled, (state, action: PayloadAction<any>) => {
        const index = state.investments.findIndex((i) => i.id === action.payload.data.id);
        if (index !== -1) {
          state.investments[index] = action.payload.data;
        }
        state.currentInvestment = action.payload.data;
      })
      // Delete investment
      .addCase(deleteInvestment.fulfilled, (state, action: PayloadAction<string>) => {
        state.investments = state.investments.filter((i) => i.id !== action.payload);
      });
  },
});

export const { clearError, clearCurrentInvestment } = investmentsSlice.actions;
export default investmentsSlice.reducer;
