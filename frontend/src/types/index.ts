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
  role?: string;
  status: 'active' | 'inactive' | 'suspended';
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
