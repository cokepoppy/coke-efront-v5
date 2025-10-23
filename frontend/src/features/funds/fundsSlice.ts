import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Fund, CreateFundData, PaginationParams } from '../../types';

interface FundsState {
  funds: Fund[];
  currentFund: Fund | null;
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

const initialState: FundsState = {
  funds: [],
  currentFund: null,
  total: 0,
  page: 1,
  pageSize: 20,
  loading: false,
  error: null,
};

export const fetchFunds = createAsyncThunk(
  'funds/fetchFunds',
  async (params: PaginationParams = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/funds', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to fetch funds'
      );
    }
  }
);

export const fetchFundById = createAsyncThunk(
  'funds/fetchFundById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/funds/${id}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to fetch fund'
      );
    }
  }
);

export const createFund = createAsyncThunk(
  'funds/createFund',
  async (data: CreateFundData, { rejectWithValue }) => {
    try {
      const response = await api.post('/funds', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to create fund'
      );
    }
  }
);

export const updateFund = createAsyncThunk(
  'funds/updateFund',
  async ({ id, data }: { id: string; data: Partial<CreateFundData> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/funds/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to update fund'
      );
    }
  }
);

export const deleteFund = createAsyncThunk(
  'funds/deleteFund',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/funds/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to delete fund'
      );
    }
  }
);

const fundsSlice = createSlice({
  name: 'funds',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentFund: (state) => {
      state.currentFund = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch funds
      .addCase(fetchFunds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFunds.fulfilled, (state, action) => {
        state.loading = false;
        state.funds = action.payload.data;
        state.total = action.payload.pagination.total;
        state.page = action.payload.pagination.page;
        state.pageSize = action.payload.pagination.pageSize;
      })
      .addCase(fetchFunds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch fund by ID
      .addCase(fetchFundById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFundById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFund = action.payload;
      })
      .addCase(fetchFundById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create fund
      .addCase(createFund.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFund.fulfilled, (state, action) => {
        state.loading = false;
        state.funds.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createFund.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update fund
      .addCase(updateFund.fulfilled, (state, action) => {
        const index = state.funds.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) {
          state.funds[index] = action.payload;
        }
        if (state.currentFund?.id === action.payload.id) {
          state.currentFund = action.payload;
        }
      })
      // Delete fund
      .addCase(deleteFund.fulfilled, (state, action) => {
        state.funds = state.funds.filter((f) => f.id !== action.payload);
        state.total -= 1;
      });
  },
});

export const { clearError, clearCurrentFund } = fundsSlice.actions;
export default fundsSlice.reducer;
