export interface FinancialRecord {
  id: string;
  farmId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string;
  date: Date;
  description: string;
  paymentMethod?: string;
  receiptUrl?: string;
  tags?: string[];
  cropId?: string;
  livestockId?: string;
}

export interface CashflowForecast {
  id: string;
  farmId: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  projections: CashflowProjection[];
  assumptions: ForecastAssumption[];
  lastUpdated: Date;
}

export interface CashflowProjection {
  period: string;
  startDate: Date;
  endDate: Date;
  projectedIncome: number;
  projectedExpenses: number;
  netCashflow: number;
  cumulativeCashflow: number;
  confidence: number;
}

export interface ForecastAssumption {
  category: string;
  description: string;
  value: number;
  unit: string;
  source: 'historical' | 'market' | 'estimate';
}

export interface Invoice {
  id: string;
  farmId: string;
  invoiceNumber: string;
  type: 'sales' | 'purchase';
  customerId?: string;
  supplierId?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  issueDate: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentTerms: string;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
  productId?: string;
}

export interface BNPLApplication {
  id: string;
  farmerId: string;
  farmId: string;
  requestedAmount: number;
  currency: string;
  purpose: string;
  products: BNPLProduct[];
  creditAssessment: CreditAssessment;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'repaid';
  approvedAmount?: number;
  interestRate?: number;
  repaymentTerms?: RepaymentTerms;
  applicationDate: Date;
  approvalDate?: Date;
  disbursementDate?: Date;
}

export interface BNPLProduct {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplier: string;
}

export interface CreditAssessment {
  id: string;
  farmerId: string;
  score: number;
  factors: CreditFactor[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendedLimit: number;
  assessmentDate: Date;
  validUntil: Date;
}

export interface CreditFactor {
  factor: string;
  value: number;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface RepaymentTerms {
  totalAmount: number;
  installments: number;
  installmentAmount: number;
  frequency: 'weekly' | 'monthly' | 'seasonal';
  startDate: Date;
  endDate: Date;
  gracePeriod?: number;
  penaltyRate?: number;
}

export interface MicroInsurance {
  id: string;
  farmerId: string;
  farmId: string;
  policyType: 'weather_index' | 'crop_yield' | 'livestock_mortality' | 'equipment';
  policyNumber: string;
  coverageAmount: number;
  premium: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled' | 'claimed';
  parameters: InsuranceParameter[];
  claims: InsuranceClaim[];
}

export interface InsuranceParameter {
  parameter: string;
  threshold: number;
  unit: string;
  triggerCondition: string;
  payoutPercentage: number;
}

export interface InsuranceClaim {
  id: string;
  policyId: string;
  claimDate: Date;
  triggerEvent: string;
  claimAmount: number;
  status: 'submitted' | 'processing' | 'approved' | 'rejected' | 'paid';
  evidence: ClaimEvidence[];
  assessmentReport?: string;
  payoutDate?: Date;
  payoutAmount?: number;
}

export interface ClaimEvidence {
  type: 'photo' | 'weather_data' | 'field_report' | 'satellite_data';
  url: string;
  description: string;
  timestamp: Date;
  gpsLocation?: {
    latitude: number;
    longitude: number;
  };
}
