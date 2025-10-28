import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Document, CreateDocumentData, PaginatedResponse, DocumentStats, PaginationParams } from '../../types';

interface DocumentsState {
  documents: Document[];
  currentDocument: Document | null;
  stats: DocumentStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const initialState: DocumentsState = {
  documents: [],
  currentDocument: null,
  stats: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  },
};

export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async (params: PaginationParams & {
    documentType?: string;
    category?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/documents', { params });
      return response.data as PaginatedResponse<Document>;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to fetch documents'
      );
    }
  }
);

export const fetchDocumentById = createAsyncThunk(
  'documents/fetchDocumentById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/documents/${id}`);
      return response.data.data as Document;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to fetch document'
      );
    }
  }
);

export const createDocument = createAsyncThunk(
  'documents/createDocument',
  async (data: CreateDocumentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/documents', data);
      return response.data.data as Document;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to create document'
      );
    }
  }
);

export const updateDocument = createAsyncThunk(
  'documents/updateDocument',
  async (
    { id, data }: { id: string; data: Partial<CreateDocumentData> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/documents/${id}`, data);
      return response.data.data as Document;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to update document'
      );
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/documents/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to delete document'
      );
    }
  }
);

export const fetchDocumentStats = createAsyncThunk(
  'documents/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/documents/stats');
      return response.data.data as DocumentStats;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to fetch document stats'
      );
    }
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Documents
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Document By ID
      .addCase(fetchDocumentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDocument = action.payload;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Document
      .addCase(createDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents.unshift(action.payload);
      })
      .addCase(createDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Document
      .addCase(updateDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.documents.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        if (state.currentDocument?.id === action.payload.id) {
          state.currentDocument = action.payload;
        }
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Document
      .addCase(deleteDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = state.documents.filter((d) => d.id !== action.payload);
        if (state.currentDocument?.id === action.payload) {
          state.currentDocument = null;
        }
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Stats
      .addCase(fetchDocumentStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocumentStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDocumentStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentDocument } = documentsSlice.actions;
export default documentsSlice.reducer;
