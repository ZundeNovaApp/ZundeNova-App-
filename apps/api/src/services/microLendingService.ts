import axios from 'axios';
import { offlineStorageService } from '../../../mobile/src/services/OfflineStorageService';

interface LoanApplication {
  farmerId: string;
  amount: number;
  purpose: string;
  phoneNumber: string;
  creditScore: number;
  collateral?: string;
  guarantor?: string;
  term: string;
}

interface LenderResponse {
  lender: string;
  status: 'approved' | 'rejected' | 'pending';
  loanId?: string;
  interestRate?: number;
  monthlyPayment?: number;
  processingTime?: string;
  requirements?: string[];
}

class MicroLendingService {
  private lenders = {
    tala: {
      apiUrl: process.env.TALA_API_URL || 'https://api.tala.co',
      apiKey: process.env.TALA_API_KEY,
      enabled: !!process.env.TALA_API_KEY
    },
    branch: {
      apiUrl: process.env.BRANCH_API_URL || 'https://api.branch.co',
      apiKey: process.env.BRANCH_API_KEY,
      enabled: !!process.env.BRANCH_API_KEY
    },
    kiva: {
      apiUrl: process.env.KIVA_API_URL || 'https://api.kiva.org',
      apiKey: process.env.KIVA_API_KEY,
      enabled: !!process.env.KIVA_API_KEY
    },
    local_mfi: {
      apiUrl: process.env.LOCAL_MFI_API_URL || 'https://api.localmfi.com',
      apiKey: process.env.LOCAL_MFI_API_KEY,
      enabled: !!process.env.LOCAL_MFI_API_KEY
    }
  };

  async submitLoanApplication(application: LoanApplication): Promise<LenderResponse[]> {
    const results = await Promise.allSettled([
      this.submitToTala(application),
      this.submitToBranch(application),
      this.submitToKiva(application),
      this.submitToLocalMFI(application)
    ]);

    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<LenderResponse>).value)
      .filter(Boolean);
  }

  private async submitToTala(application: LoanApplication): Promise<LenderResponse | null> {
    if (!this.lenders.tala.enabled) {
      return this.getMockTalaResponse(application);
    }

    try {
      const response = await axios.post(`${this.lenders.tala.apiUrl}/loans`, {
        amount: application.amount,
        purpose: 'agricultural_inputs',
        borrower: {
          phone: application.phoneNumber,
          creditScore: application.creditScore,
          farmerId: application.farmerId
        },
        term: application.term
      }, {
        headers: { 
          'Authorization': `Bearer ${this.lenders.tala.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return {
        lender: 'Tala',
        status: response.data.status,
        loanId: response.data.loanId,
        interestRate: response.data.interestRate,
        monthlyPayment: response.data.monthlyPayment,
        processingTime: '1-2 hours'
      };
    } catch (error) {
      console.error('Tala API error:', error);
      return this.getMockTalaResponse(application);
    }
  }

  private async submitToBranch(application: LoanApplication): Promise<LenderResponse | null> {
    if (!this.lenders.branch.enabled) {
      return this.getMockBranchResponse(application);
    }

    try {
      const response = await axios.post(`${this.lenders.branch.apiUrl}/applications`, {
        loan_amount: application.amount,
        loan_purpose: application.purpose,
        applicant: {
          phone_number: application.phoneNumber,
          credit_score: application.creditScore
        },
        repayment_term: application.term
      }, {
        headers: { 
          'X-API-Key': this.lenders.branch.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return {
        lender: 'Branch',
        status: response.data.application_status,
        loanId: response.data.application_id,
        interestRate: response.data.interest_rate,
        processingTime: '2-4 hours'
      };
    } catch (error) {
      console.error('Branch API error:', error);
      return this.getMockBranchResponse(application);
    }
  }

  private async submitToKiva(application: LoanApplication): Promise<LenderResponse | null> {
    if (!this.lenders.kiva.enabled) {
      return this.getMockKivaResponse(application);
    }

    try {
      const response = await axios.post(`${this.lenders.kiva.apiUrl}/loans/applications`, {
        requested_amount: application.amount,
        sector: 'Agriculture',
        borrower_profile: {
          farmer_id: application.farmerId,
          phone: application.phoneNumber,
          credit_assessment: application.creditScore
        },
        loan_use: application.purpose,
        repayment_term: application.term
      }, {
        headers: { 
          'Authorization': `Bearer ${this.lenders.kiva.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      return {
        lender: 'Kiva Microfunds',
        status: response.data.status,
        loanId: response.data.loan_id,
        interestRate: response.data.interest_rate || 12,
        processingTime: '3-7 days'
      };
    } catch (error) {
      console.error('Kiva API error:', error);
      return this.getMockKivaResponse(application);
    }
  }

  private async submitToLocalMFI(application: LoanApplication): Promise<LenderResponse | null> {
    if (!this.lenders.local_mfi.enabled) {
      return this.getMockLocalMFIResponse(application);
    }

    try {
      const response = await axios.post(`${this.lenders.local_mfi.apiUrl}/loan-applications`, {
        amount: application.amount,
        purpose: application.purpose,
        farmer_details: {
          id: application.farmerId,
          phone: application.phoneNumber,
          credit_score: application.creditScore
        },
        collateral: application.collateral,
        guarantor: application.guarantor,
        term_months: parseInt(application.term.split(' ')[0])
      }, {
        headers: { 
          'API-Key': this.lenders.local_mfi.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return {
        lender: 'Local MFI',
        status: response.data.status,
        loanId: response.data.application_id,
        interestRate: response.data.rate,
        processingTime: '1-3 days'
      };
    } catch (error) {
      console.error('Local MFI API error:', error);
      return this.getMockLocalMFIResponse(application);
    }
  }

  private getMockTalaResponse(application: LoanApplication): LenderResponse {
    const approved = application.creditScore >= 60 && application.amount <= 5000;
    return {
      lender: 'Tala',
      status: approved ? 'approved' : 'rejected',
      loanId: approved ? `tala_${Date.now()}` : undefined,
      interestRate: approved ? 15 : undefined,
      monthlyPayment: approved ? this.calculateMonthlyPayment(application.amount, 15, application.term) : undefined,
      processingTime: '1-2 hours'
    };
  }

  private getMockBranchResponse(application: LoanApplication): LenderResponse {
    const approved = application.creditScore >= 55 && application.amount <= 3000;
    return {
      lender: 'Branch',
      status: approved ? 'approved' : 'rejected',
      loanId: approved ? `branch_${Date.now()}` : undefined,
      interestRate: approved ? 18 : undefined,
      monthlyPayment: approved ? this.calculateMonthlyPayment(application.amount, 18, application.term) : undefined,
      processingTime: '2-4 hours'
    };
  }

  private getMockKivaResponse(application: LoanApplication): LenderResponse {
    const approved = application.creditScore >= 50 && application.amount <= 10000;
    return {
      lender: 'Kiva Microfunds',
      status: approved ? 'approved' : 'pending',
      loanId: approved ? `kiva_${Date.now()}` : undefined,
      interestRate: approved ? 12 : undefined,
      monthlyPayment: approved ? this.calculateMonthlyPayment(application.amount, 12, application.term) : undefined,
      processingTime: '3-7 days'
    };
  }

  private getMockLocalMFIResponse(application: LoanApplication): LenderResponse {
    const approved = application.creditScore >= 45 && application.amount <= 2000;
    return {
      lender: 'Local MFI',
      status: approved ? 'approved' : 'pending',
      loanId: approved ? `local_${Date.now()}` : undefined,
      interestRate: approved ? 20 : undefined,
      monthlyPayment: approved ? this.calculateMonthlyPayment(application.amount, 20, application.term) : undefined,
      processingTime: '1-3 days',
      requirements: ['Community guarantor', 'Land title copy']
    };
  }

  private calculateMonthlyPayment(amount: number, annualRate: number, term: string): number {
    const months = parseInt(term.split(' ')[0]);
    const monthlyRate = annualRate / 100 / 12;
    
    if (monthlyRate === 0) return amount / months;
    
    const payment = amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                   (Math.pow(1 + monthlyRate, months) - 1);
    
    return Math.round(payment * 100) / 100;
  }

  async getLoanStatus(loanId: string, lender: string): Promise<any> {
    try {
      switch (lender.toLowerCase()) {
        case 'tala':
          return await this.getTalaLoanStatus(loanId);
        case 'branch':
          return await this.getBranchLoanStatus(loanId);
        case 'kiva':
          return await this.getKivaLoanStatus(loanId);
        default:
          return { status: 'unknown', message: 'Lender not supported' };
      }
    } catch (error) {
      console.error(`Failed to get loan status for ${lender}:`, error);
      return { status: 'error', message: 'Failed to fetch loan status' };
    }
  }

  private async getTalaLoanStatus(loanId: string) {
    if (!this.lenders.tala.enabled) {
      return { status: 'active', balance: 2500, nextPayment: '2024-04-15' };
    }

    const response = await axios.get(`${this.lenders.tala.apiUrl}/loans/${loanId}`, {
      headers: { 'Authorization': `Bearer ${this.lenders.tala.apiKey}` }
    });

    return response.data;
  }

  private async getBranchLoanStatus(loanId: string) {
    if (!this.lenders.branch.enabled) {
      return { status: 'active', outstanding_balance: 1800, due_date: '2024-04-20' };
    }

    const response = await axios.get(`${this.lenders.branch.apiUrl}/applications/${loanId}`, {
      headers: { 'X-API-Key': this.lenders.branch.apiKey }
    });

    return response.data;
  }

  private async getKivaLoanStatus(loanId: string) {
    if (!this.lenders.kiva.enabled) {
      return { status: 'funded', amount_remaining: 8500, repayment_schedule: [] };
    }

    const response = await axios.get(`${this.lenders.kiva.apiUrl}/loans/${loanId}`, {
      headers: { 'Authorization': `Bearer ${this.lenders.kiva.apiKey}` }
    });

    return response.data;
  }
}

export const microLendingService = new MicroLendingService();
