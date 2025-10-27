import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface FundPerformance {
  id: string;
  fundId: string;
  fundName: string;
  currency: string;
  vintageYear?: number;
  // Capital metrics
  totalCommitments: number;
  totalCalled: number;
  totalDistributed: number;
  totalValue: number;
  netAssetValue: number;
  unrealizedValue: number;
  realizedValue: number;
  // Performance ratios
  irr: number; // Internal Rate of Return (%)
  tvpi: number; // Total Value to Paid-In
  dpi: number; // Distributions to Paid-In
  rvpi: number; // Residual Value to Paid-In
  moic: number; // Multiple on Invested Capital
  // Additional metrics
  managementFees: number;
  performanceFees: number;
  expenses: number;
  calculatedAt: string;
}

export interface InvestmentPerformance {
  id: string;
  investmentId: string;
  companyName: string;
  fundId: string;
  fundName: string;
  currency: string;
  sector?: string;
  // Investment details
  investmentDate: string;
  exitDate?: string;
  initialInvestment: number;
  additionalInvestments: number;
  totalInvested: number;
  // Returns
  distributions: number;
  currentValue: number;
  totalValue: number;
  realizedGain: number;
  unrealizedGain: number;
  // Performance metrics
  irr: number;
  moic: number;
  holdingPeriod: number; // in months
  status: 'active' | 'exited' | 'written-off';
  calculatedAt: string;
}

export interface PerformanceSummary {
  totalFunds: number;
  totalInvestments: number;
  totalCommitments: number;
  totalCalled: number;
  totalDistributed: number;
  totalNetAssetValue: number;
  averageIRR: number;
  averageTVPI: number;
  averageDPI: number;
  averageRVPI: number;
  currency: string;
}

export interface InvestorReport {
  id: string;
  investorId: string;
  fundId: string;
  reportType: 'quarterly' | 'annual';
  year: number;
  quarter?: number; // 1-4 for quarterly reports
  reportDate: string;
  status: 'draft' | 'generated' | 'sent';
  generatedAt?: string;
  sentAt?: string;
  reportUrl?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  investor?: {
    id: string;
    name: string;
    email?: string;
  };
  fund?: {
    id: string;
    name: string;
    currency: string;
  };
  // Report data
  summary?: {
    commitment: number;
    called: number;
    distributed: number;
    netAssetValue: number;
    irr: number;
    tvpi: number;
    dpi: number;
  };
}

interface ReportsState {
  fundPerformances: FundPerformance[];
  investmentPerformances: InvestmentPerformance[];
  performanceSummary: PerformanceSummary | null;
  currentFundPerformance: FundPerformance | null;
  currentInvestmentPerformance: InvestmentPerformance | null;
  investorReports: InvestorReport[];
  currentInvestorReport: InvestorReport | null;
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  fundPerformances: [],
  investmentPerformances: [],
  performanceSummary: null,
  currentFundPerformance: null,
  currentInvestmentPerformance: null,
  investorReports: [],
  currentInvestorReport: null,
  total: 0,
  page: 1,
  pageSize: 10,
  loading: false,
  error: null,
};

// Async thunks
export const fetchFundPerformances = createAsyncThunk(
  'reports/fetchFundPerformances',
  async (params?: {
    fundId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get('/reports/fund-performance', { params });
    return response.data;
  }
);

export const fetchFundPerformanceById = createAsyncThunk(
  'reports/fetchFundPerformanceById',
  async (fundId: string) => {
    const response = await api.get(`/reports/fund-performance/${fundId}`);
    return response.data;
  }
);

export const fetchInvestmentPerformances = createAsyncThunk(
  'reports/fetchInvestmentPerformances',
  async (params?: {
    fundId?: string;
    investmentId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get('/reports/investment-performance', { params });
    return response.data;
  }
);

export const fetchInvestmentPerformanceById = createAsyncThunk(
  'reports/fetchInvestmentPerformanceById',
  async (investmentId: string) => {
    const response = await api.get(`/reports/investment-performance/${investmentId}`);
    return response.data;
  }
);

export const fetchPerformanceSummary = createAsyncThunk(
  'reports/fetchPerformanceSummary',
  async (params?: {
    fundId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get('/reports/performance-summary', { params });
    return response.data;
  }
);

// Investor Reports
export const fetchInvestorReports = createAsyncThunk(
  'reports/fetchInvestorReports',
  async (params?: {
    page?: number;
    pageSize?: number;
    investorId?: string;
    fundId?: string;
    reportType?: string;
    year?: number;
    status?: string;
    search?: string;
  }) => {
    const response = await api.get('/reports/investor-reports', { params });
    return response.data;
  }
);

export const fetchInvestorReportById = createAsyncThunk(
  'reports/fetchInvestorReportById',
  async (id: string) => {
    const response = await api.get(`/reports/investor-reports/${id}`);
    return response.data;
  }
);

export const createInvestorReport = createAsyncThunk(
  'reports/createInvestorReport',
  async (data: {
    investorId: string;
    fundId: string;
    reportType: string;
    year: number;
    quarter?: number;
    reportDate: string;
    notes?: string;
  }) => {
    const response = await api.post('/reports/investor-reports', data);
    return response.data;
  }
);

export const generateInvestorReport = createAsyncThunk(
  'reports/generateInvestorReport',
  async (id: string) => {
    const response = await api.post(`/reports/investor-reports/${id}/generate`);
    return response.data;
  }
);

export const sendInvestorReport = createAsyncThunk(
  'reports/sendInvestorReport',
  async (id: string) => {
    const response = await api.post(`/reports/investor-reports/${id}/send`);
    return response.data;
  }
);

export const updateInvestorReport = createAsyncThunk(
  'reports/updateInvestorReport',
  async ({ id, data }: { id: string; data: Partial<InvestorReport> }) => {
    const response = await api.put(`/reports/investor-reports/${id}`, data);
    return response.data;
  }
);

export const deleteInvestorReport = createAsyncThunk(
  'reports/deleteInvestorReport',
  async (id: string) => {
    await api.delete(`/reports/investor-reports/${id}`);
    return id;
  }
);

export const downloadInvestorReport = createAsyncThunk(
  'reports/downloadInvestorReport',
  async (id: string) => {
    const response = await api.get(`/reports/investor-reports/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }
);

// Slice
const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentFundPerformance: (state) => {
      state.currentFundPerformance = null;
    },
    clearCurrentInvestmentPerformance: (state) => {
      state.currentInvestmentPerformance = null;
    },
    clearCurrentInvestorReport: (state) => {
      state.currentInvestorReport = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch fund performances
    builder
      .addCase(fetchFundPerformances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFundPerformances.fulfilled, (state, action) => {
        state.loading = false;
        state.fundPerformances = action.payload;
      })
      .addCase(fetchFundPerformances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch fund performances';
      });

    // Fetch fund performance by ID
    builder
      .addCase(fetchFundPerformanceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFundPerformanceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFundPerformance = action.payload;
      })
      .addCase(fetchFundPerformanceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch fund performance';
      });

    // Fetch investment performances
    builder
      .addCase(fetchInvestmentPerformances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestmentPerformances.fulfilled, (state, action) => {
        state.loading = false;
        state.investmentPerformances = action.payload;
      })
      .addCase(fetchInvestmentPerformances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch investment performances';
      });

    // Fetch investment performance by ID
    builder
      .addCase(fetchInvestmentPerformanceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestmentPerformanceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvestmentPerformance = action.payload;
      })
      .addCase(fetchInvestmentPerformanceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch investment performance';
      });

    // Fetch performance summary
    builder
      .addCase(fetchPerformanceSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPerformanceSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.performanceSummary = action.payload;
      })
      .addCase(fetchPerformanceSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch performance summary';
      });

    // Fetch investor reports
    builder
      .addCase(fetchInvestorReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestorReports.fulfilled, (state, action) => {
        state.loading = false;
        state.investorReports = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchInvestorReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch investor reports';
      });

    // Fetch investor report by ID
    builder
      .addCase(fetchInvestorReportById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestorReportById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvestorReport = action.payload;
      })
      .addCase(fetchInvestorReportById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch investor report';
      });

    // Create investor report
    builder
      .addCase(createInvestorReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInvestorReport.fulfilled, (state, action) => {
        state.loading = false;
        state.investorReports.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createInvestorReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create investor report';
      });

    // Generate investor report
    builder
      .addCase(generateInvestorReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateInvestorReport.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.investorReports.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.investorReports[index] = action.payload;
        }
        if (state.currentInvestorReport?.id === action.payload.id) {
          state.currentInvestorReport = action.payload;
        }
      })
      .addCase(generateInvestorReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to generate investor report';
      });

    // Send investor report
    builder
      .addCase(sendInvestorReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendInvestorReport.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.investorReports.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.investorReports[index] = action.payload;
        }
        if (state.currentInvestorReport?.id === action.payload.id) {
          state.currentInvestorReport = action.payload;
        }
      })
      .addCase(sendInvestorReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send investor report';
      });

    // Update investor report
    builder
      .addCase(updateInvestorReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInvestorReport.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.investorReports.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.investorReports[index] = action.payload;
        }
        if (state.currentInvestorReport?.id === action.payload.id) {
          state.currentInvestorReport = action.payload;
        }
      })
      .addCase(updateInvestorReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update investor report';
      });

    // Delete investor report
    builder
      .addCase(deleteInvestorReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInvestorReport.fulfilled, (state, action) => {
        state.loading = false;
        state.investorReports = state.investorReports.filter((r) => r.id !== action.payload);
        state.total -= 1;
      })
      .addCase(deleteInvestorReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete investor report';
      });

    // Download investor report
    builder
      .addCase(downloadInvestorReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadInvestorReport.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(downloadInvestorReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to download investor report';
      });
  },
});

export const {
  clearError,
  clearCurrentFundPerformance,
  clearCurrentInvestmentPerformance,
  clearCurrentInvestorReport,
  setPage,
  setPageSize,
} = reportsSlice.actions;
export default reportsSlice.reducer;
