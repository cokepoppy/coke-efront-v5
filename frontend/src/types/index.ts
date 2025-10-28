// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

// User types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  role?: {
    id: string;
    name: string;
    permissions: any;
  };
  status?: 'active' | 'inactive' | 'suspended';
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Fund types
export type FundType = 'PE' | 'VC' | 'RE' | 'Infrastructure' | 'Debt';
export type FundStatus = 'fundraising' | 'investing' | 'harvesting' | 'liquidated';

export interface Fund {
  id: string;
  name: string;
  fundType: FundType;
  totalSize: number;
  currency: string;
  vintageYear: number;
  inceptionDate: string;
  fundTerm?: number;
  extensionPeriod?: number;
  status: FundStatus;
  managerId?: string;
  custodianBank?: string;
  domicile?: string;
  managementFeeRate?: number;
  performanceFeeRate?: number;
  hurdleRate?: number;
  createdAt: string;
  _count?: {
    investments: number;
    fundInvestors: number;
  };
}

export interface FundMetric {
  id: string;
  fundId: string;
  asOfDate: string;
  nav?: number;
  irr?: number;
  moic?: number;
  dpi?: number;
  rvpi?: number;
  tvpi?: number;
  committedCapital?: number;
  calledCapital?: number;
  distributedCapital?: number;
  remainingValue?: number;
}

export interface CreateFundData {
  name: string;
  fundType: FundType;
  totalSize: number;
  currency?: string;
  vintageYear: number;
  inceptionDate: string;
  fundTerm?: number;
  extensionPeriod?: number;
  managerId?: string;
  custodianBank?: string;
  domicile?: string;
  managementFeeRate?: number;
  performanceFeeRate?: number;
  hurdleRate?: number;
}

// Investment types
export type InvestmentStage = 'seed' | 'early' | 'growth' | 'late' | 'buyout';
export type InvestmentType = 'equity' | 'debt' | 'convertible' | 'preferred';
export type InvestmentStatus = 'pipeline' | 'dueDiligence' | 'approved' | 'active' | 'exited';

export interface Investment {
  id: string;
  fundId: string;
  companyName: string;
  industry?: string;
  sector?: string;
  region?: string;
  country?: string;
  investmentDate: string;
  investmentStage: InvestmentStage;
  investmentType: InvestmentType;
  initialInvestment: number;
  ownershipPercentage?: number;
  currentValuation?: number;
  status: InvestmentStatus;
  createdAt: string;
}

// Investor types
export type InvestorType = 'institutional' | 'corporate' | 'familyOffice' | 'hnwi' | 'fundOfFunds';
export type InvestorStatus = 'active' | 'inactive';

export interface Investor {
  id: string;
  name: string;
  investorType: InvestorType;
  domicile?: string;
  country?: string;
  email?: string;
  phone?: string;
  status: InvestorStatus;
  createdAt: string;
}

// Pagination params
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// Document types
export type DocumentType = 'contract' | 'report' | 'statement' | 'certificate' | 'presentation' | 'other';
export type DocumentCategory = 'fund' | 'investment' | 'investor' | 'legal' | 'financial' | 'compliance' | 'other';
export type RelatedEntityType = 'fund' | 'investment' | 'investor' | 'capitalCall' | 'distribution';

export interface Document {
  id: string;
  name: string;
  documentType?: DocumentType | string;
  category?: DocumentCategory | string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  version: number;
  parentId?: string;
  relatedEntityType?: RelatedEntityType | string;
  relatedEntityId?: string;
  tags?: any;
  isPublic: boolean;
  uploadedBy?: string;
  uploadedAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateDocumentData {
  name: string;
  documentType?: string;
  category?: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  tags?: any;
  isPublic?: boolean;
}

export interface DocumentStats {
  total: number;
  byType: { documentType: string; _count: number }[];
  byCategory: { category: string; _count: number }[];
  recentUploads: Document[];
}

// Event types
export type EventType = 'meeting' | 'deadline' | 'milestone' | 'holiday' | 'reminder' | 'other';
export type EventCategory = 'fund' | 'investment' | 'investor' | 'personal' | 'company' | 'other';
export type EventStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Event {
  id: string;
  title: string;
  description?: string;
  eventType?: EventType | string;
  category?: EventCategory | string;
  startDate: string;
  endDate?: string;
  location?: string;
  isAllDay: boolean;
  color?: string;
  reminder?: number;
  relatedEntityType?: string;
  relatedEntityId?: string;
  attendees?: any;
  status: EventStatus;
  createdBy?: string;
  creator?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  eventType?: string;
  category?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  isAllDay?: boolean;
  color?: string;
  reminder?: number;
  relatedEntityType?: string;
  relatedEntityId?: string;
  attendees?: any;
  status?: EventStatus;
}
