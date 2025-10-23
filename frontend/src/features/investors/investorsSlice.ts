import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Investor {
  id: string;
  name: string;
  investorType: 'institutional' | 'corporate' | 'familyOffice' | 'hnwi' | 'fundOfFunds';
  entityType?: 'individual' | 'partnership' | 'corporation' | 'trust';
  domicile?: string;
  country?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  kycStatus: 'pending' | 'inProgress' | 'approved' | 'rejected';
  kycDate?: string;
  amlStatus: 'pending' | 'inProgress' | 'approved' | 'rejected';
  amlDate?: string;
  accredited: boolean;
  firstInvestmentDate?: string;
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    fundInvestors?: number;
  };
}

interface InvestorsState {
  investors: Investor[];
  currentInvestor: Investor | null;
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

const initialState: InvestorsState = {
  investors: [],
  currentInvestor: null,
  total: 0,
  page: 1,
  pageSize: 10,
  loading: false,
  error: null,
};

// Async thunks
export const fetchInvestors = createAsyncThunk(
  'investors/fetchInvestors',
  async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    investorType?: string;
    status?: string;
    kycStatus?: string;
  }) => {
    const response = await api.get('/investors', { params });
    return response.data;
  }
);

export const fetchInvestorById = createAsyncThunk(
  'investors/fetchInvestorById',
  async (id: string) => {
    const response = await api.get(`/investors/${id}`);
    return response.data;
  }
);

export const createInvestor = createAsyncThunk(
  'investors/createInvestor',
  async (investorData: Partial<Investor>) => {
    const response = await api.post('/investors', investorData);
    return response.data;
  }
);

export const updateInvestor = createAsyncThunk(
  'investors/updateInvestor',
  async ({ id, data }: { id: string; data: Partial<Investor> }) => {
    const response = await api.put(`/investors/${id}`, data);
    return response.data;
  }
);

export const deleteInvestor = createAsyncThunk(
  'investors/deleteInvestor',
  async (id: string) => {
    await api.delete(`/investors/${id}`);
    return id;
  }
);

// Slice
const investorsSlice = createSlice({
  name: 'investors',
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
    clearCurrentInvestor: (state) => {
      state.currentInvestor = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch investors
    builder
      .addCase(fetchInvestors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestors.fulfilled, (state, action) => {
        state.loading = false;
        state.investors = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchInvestors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch investors';
      });

    // Fetch investor by ID
    builder
      .addCase(fetchInvestorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestorById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvestor = action.payload;
      })
      .addCase(fetchInvestorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch investor';
      });

    // Create investor
    builder
      .addCase(createInvestor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInvestor.fulfilled, (state, action) => {
        state.loading = false;
        state.investors.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createInvestor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create investor';
      });

    // Update investor
    builder
      .addCase(updateInvestor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInvestor.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.investors.findIndex((inv) => inv.id === action.payload.id);
        if (index !== -1) {
          state.investors[index] = action.payload;
        }
        if (state.currentInvestor?.id === action.payload.id) {
          state.currentInvestor = action.payload;
        }
      })
      .addCase(updateInvestor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update investor';
      });

    // Delete investor
    builder
      .addCase(deleteInvestor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInvestor.fulfilled, (state, action) => {
        state.loading = false;
        state.investors = state.investors.filter((inv) => inv.id !== action.payload);
        state.total -= 1;
      })
      .addCase(deleteInvestor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete investor';
      });
  },
});

export const { setPage, setPageSize, clearError, clearCurrentInvestor } = investorsSlice.actions;
export default investorsSlice.reducer;
