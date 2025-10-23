import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:3000/api/v1/valuations";

export interface Valuation {
  id: string;
  investmentId: string;
  valuationDate: string;
  fairValue: number;
  valuationMethod: "market" | "income" | "cost" | "transaction";
  multiple?: number;
  notes?: string;
  audited: boolean;
  createdBy?: string;
  createdAt: string;
  investment?: {
    id: string;
    companyName: string;
    fundId: string;
    fund: {
      id: string;
      name: string;
    };
  };
}

interface ValuationsState {
  valuations: Valuation[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const initialState: ValuationsState = {
  valuations: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchValuations = createAsyncThunk(
  "valuations/fetchValuations",
  async (params?: {
    page?: number;
    pageSize?: number;
    investmentId?: string;
    valuationMethod?: string;
    audited?: boolean;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) => {
    const response = await axios.get(API_URL, { params });
    return response.data;
  }
);

export const fetchValuationById = createAsyncThunk(
  "valuations/fetchValuationById",
  async (id: string) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  }
);

export const fetchValuationsByInvestmentId = createAsyncThunk(
  "valuations/fetchValuationsByInvestmentId",
  async (investmentId: string) => {
    const response = await axios.get(`${API_URL}/investment/${investmentId}`);
    return response.data;
  }
);

export const fetchLatestValuation = createAsyncThunk(
  "valuations/fetchLatestValuation",
  async (investmentId: string) => {
    const response = await axios.get(
      `${API_URL}/investment/${investmentId}/latest`
    );
    return response.data;
  }
);

export const fetchValuationHistory = createAsyncThunk(
  "valuations/fetchValuationHistory",
  async (investmentId: string) => {
    const response = await axios.get(
      `${API_URL}/investment/${investmentId}/history`
    );
    return response.data;
  }
);

export const createValuation = createAsyncThunk(
  "valuations/createValuation",
  async (data: {
    investmentId: string;
    valuationDate: Date;
    fairValue: number;
    valuationMethod: "market" | "income" | "cost" | "transaction";
    multiple?: number;
    notes?: string;
    audited?: boolean;
    createdBy?: string;
  }) => {
    const response = await axios.post(API_URL, data);
    return response.data;
  }
);

export const updateValuation = createAsyncThunk(
  "valuations/updateValuation",
  async ({
    id,
    data,
  }: {
    id: string;
    data: {
      valuationDate?: Date;
      fairValue?: number;
      valuationMethod?: "market" | "income" | "cost" | "transaction";
      multiple?: number;
      notes?: string;
      audited?: boolean;
    };
  }) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  }
);

export const deleteValuation = createAsyncThunk(
  "valuations/deleteValuation",
  async (id: string) => {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  }
);

// Slice
const valuationsSlice = createSlice({
  name: "valuations",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch valuations
      .addCase(fetchValuations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchValuations.fulfilled, (state, action) => {
        state.loading = false;
        state.valuations = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchValuations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "获取估值列表失败";
      })

      // Fetch valuation by ID
      .addCase(fetchValuationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchValuationById.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(fetchValuationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "获取估值详情失败";
      })

      // Fetch valuations by investment ID
      .addCase(fetchValuationsByInvestmentId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchValuationsByInvestmentId.fulfilled, (state, action) => {
        state.loading = false;
        state.valuations = action.payload.data;
      })
      .addCase(fetchValuationsByInvestmentId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "获取投资估值列表失败";
      })

      // Create valuation
      .addCase(createValuation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createValuation.fulfilled, (state, action) => {
        state.loading = false;
        state.valuations.unshift(action.payload.data);
        state.pagination.total += 1;
      })
      .addCase(createValuation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "创建估值失败";
      })

      // Update valuation
      .addCase(updateValuation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateValuation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.valuations.findIndex(
          (v) => v.id === action.payload.data.id
        );
        if (index !== -1) {
          state.valuations[index] = action.payload.data;
        }
      })
      .addCase(updateValuation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "更新估值失败";
      })

      // Delete valuation
      .addCase(deleteValuation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteValuation.fulfilled, (state, action) => {
        state.loading = false;
        state.valuations = state.valuations.filter(
          (v) => v.id !== action.payload
        );
        state.pagination.total -= 1;
      })
      .addCase(deleteValuation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "删除估值失败";
      });
  },
});

export const { clearError } = valuationsSlice.actions;
export default valuationsSlice.reducer;
