import axios from 'axios';

interface LoanApplication {
  farmerId: string;
  amount: number;
  purpose: string;
  duration: number; // months
  phoneNumber: string;
  creditScore?: number;
  collateral?: string;
  farmSize?: number;
  cropType?: string;
  expectedYield?: number;
  previousLoans?: LoanHistory[];
}

interface LoanHistory {
  lender: string;
  amount: number;
  status: 'paid' | 'defaulted' | 'current';
  date: string;
}

interface LoanOffer {
  lender: string;
  amount: number;
  interestRate: number;
  duration: number;
  monthlyPayment: number;
  totalRepayment: number;
  requirements: string[];
  approvalTime: string;
  disbursementTime: string;
  loanId: string;
  status: 'pre_approved' | 'pending' | 'approved' | 'rejected';
}

interface InsurancePolicy {
  provider: string;
  type: 'crop' | 'livestock' | 'weather' | 'life';
  coverage: number;
  premium: number;
  duration: number;
  conditions: string[];
  policyId: string;
}

interface MarketPrice {
  commodity: string;
  location: string;
  prices: {
    wholesale?: number;
    retail?: number;
    farmgate?: number;
  };
  currency: string;
  unit: string;
  trends: PriceTrend[];
  lastUpdated: string;
  forecast?: PriceForecast[];
}

interface PriceTrend {
  date: string;
  price: number;
  change: number;
  changePercent: number;
}

interface PriceForecast {
  date: string;
  predictedPrice: number;
  confidence: number;
  factors: string[];
}

class ComprehensiveFinanceService {
  private lenders = {
    tala: {
      name: 'Tala',
      apiUrl: 'https://api.tala.co',
      apiKey: process.env.TALA_API_KEY,
      maxAmount: 50000,
      minAmount: 500,
      interestRate: 15,
      processingTime: '24 hours'
    },
    branch: {
      name: 'Branch',
      apiUrl: 'https://api.branch.co',
      apiKey: process.env.BRANCH_API_KEY,
      maxAmount: 100000,
      minAmount: 1000,
      interestRate: 18,
      processingTime: '48 hours'
    },
    kiva: {
      name: 'Kiva Microfunds',
      apiUrl: 'https://api.kiva.org',
      apiKey: process.env.KIVA_API_KEY,
      maxAmount: 25000,
      minAmount: 2000,
      interestRate: 12,
      processingTime: '7 days'
    },
    local_mfi: {
      name: 'Local MFI',
      apiUrl: process.env.LOCAL_MFI_API_URL || 'https://api.localmfi.com',
      apiKey: process.env.LOCAL_MFI_API_KEY,
      maxAmount: 75000,
      minAmount: 1500,
      interestRate: 20,
      processingTime: '3 days'
    }
  };

  private insuranceProviders = {
    pula: {
      name: 'Pula',
      apiUrl: 'https://api.pula.com',
      apiKey: process.env.PULA_API_KEY,
      types: ['crop', 'weather']
    },
    worldcover: {
      name: 'WorldCover',
      apiUrl: 'https://api.worldcover.com',
      apiKey: process.env.WORLDCOVER_API_KEY,
      types: ['crop', 'livestock']
    },
    hollard: {
      name: 'Hollard',
      apiUrl: 'https://api.hollard.co.za',
      apiKey: process.env.HOLLARD_API_KEY,
      types: ['crop', 'livestock', 'life']
    }
  };

  private marketDataSources = {
    eagc: {
      name: 'Eastern Africa Grain Council',
      apiUrl: 'https://api.eagc.org/prices',
      apiKey: process.env.EAGC_API_KEY
    },
    ratin: {
      name: 'Regional Agricultural Trade Intelligence Network',
      apiUrl: 'https://api.ratin.net/commodities',
      apiKey: process.env.RATIN_API_KEY
    },
    local_markets: {
      name: 'Local Markets',
      apiUrl: process.env.LOCAL_MARKET_API_URL || 'https://api.localmarkets.com',
      apiKey: process.env.LOCAL_MARKET_API_KEY
    }
  };

  async submitLoanApplication(application: LoanApplication): Promise<LoanOffer[]> {
    const offers: LoanOffer[] = [];

    const lenderPromises = Object.entries(this.lenders).map(async ([key, lender]) => {
      try {
        if (application.amount >= lender.minAmount && application.amount <= lender.maxAmount) {
          const offer = await this.submitToLender(key, application, lender);
          if (offer) offers.push(offer);
        }
      } catch (error) {
        console.error(`Failed to get offer from ${lender.name}:`, error);
      }
    });

    await Promise.allSettled(lenderPromises);

    return offers.sort((a, b) => a.interestRate - b.interestRate);
  }

  private async submitToLender(
    lenderKey: string, 
    application: LoanApplication, 
    lender: any
  ): Promise<LoanOffer | null> {
    try {
      const creditScore = await this.calculateCreditScore(application);
      const riskAssessment = await this.assessRisk(application);

      const mockResponse = {
        approved: creditScore > 600 && riskAssessment.score > 0.6,
        amount: application.amount,
        interestRate: this.adjustInterestRate(lender.interestRate, creditScore, riskAssessment),
        duration: application.duration,
        loanId: `${lenderKey}_${Date.now()}`,
        requirements: this.getLenderRequirements(lenderKey, application),
        processingTime: lender.processingTime
      };

      if (!mockResponse.approved) {
        return null;
      }

      const monthlyPayment = this.calculateMonthlyPayment(
        mockResponse.amount,
        mockResponse.interestRate,
        mockResponse.duration
      );

      return {
        lender: lender.name,
        amount: mockResponse.amount,
        interestRate: mockResponse.interestRate,
        duration: mockResponse.duration,
        monthlyPayment,
        totalRepayment: monthlyPayment * mockResponse.duration,
        requirements: mockResponse.requirements,
        approvalTime: mockResponse.processingTime,
        disbursementTime: '1-2 business days after approval',
        loanId: mockResponse.loanId,
        status: 'pre_approved'
      };
    } catch (error) {
      console.error(`Error submitting to ${lender.name}:`, error);
      return null;
    }
  }

  private async calculateCreditScore(application: LoanApplication): Promise<number> {
    let score = 650; // Base score

    if (application.farmSize) {
      score += Math.min(application.farmSize * 2, 50);
    }

    if (application.previousLoans) {
      const paidLoans = application.previousLoans.filter(loan => loan.status === 'paid').length;
      const defaultedLoans = application.previousLoans.filter(loan => loan.status === 'defaulted').length;
      
      score += paidLoans * 20;
      score -= defaultedLoans * 100;
    }

    if (application.expectedYield && application.farmSize) {
      const yieldPerHectare = application.expectedYield / application.farmSize;
      if (yieldPerHectare > 3) score += 30; // Good yield
    }

    return Math.max(300, Math.min(850, score));
  }

  private async assessRisk(application: LoanApplication): Promise<{ score: number; factors: string[] }> {
    const factors: string[] = [];
    let riskScore = 0.7; // Base risk score

    const weatherRisk = await this.assessWeatherRisk(application.farmerId);
    if (weatherRisk > 0.7) {
      factors.push('High weather risk in region');
      riskScore -= 0.1;
    }

    if (application.cropType) {
      const priceVolatility = await this.assessPriceVolatility(application.cropType);
      if (priceVolatility > 0.3) {
        factors.push('High price volatility for crop type');
        riskScore -= 0.05;
      }
    }

    if (application.farmSize && application.amount / application.farmSize > 10000) {
      factors.push('High loan amount relative to farm size');
      riskScore -= 0.1;
    }

    return { score: Math.max(0.1, riskScore), factors };
  }

  private adjustInterestRate(baseRate: number, creditScore: number, riskAssessment: any): number {
    let adjustedRate = baseRate;

    if (creditScore > 750) adjustedRate -= 2;
    else if (creditScore > 700) adjustedRate -= 1;
    else if (creditScore < 600) adjustedRate += 3;
    else if (creditScore < 650) adjustedRate += 1;

    if (riskAssessment.score < 0.5) adjustedRate += 4;
    else if (riskAssessment.score < 0.6) adjustedRate += 2;

    return Math.max(8, Math.min(35, adjustedRate));
  }

  private calculateMonthlyPayment(amount: number, annualRate: number, months: number): number {
    const monthlyRate = annualRate / 100 / 12;
    const payment = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                   (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(payment * 100) / 100;
  }

  private getLenderRequirements(lenderKey: string, application: LoanApplication): string[] {
    const commonRequirements = [
      'Valid government ID',
      'Phone number verification',
      'Bank account details'
    ];

    const lenderSpecificRequirements: Record<string, string[]> = {
      tala: ['Mobile money account', 'Phone usage history'],
      branch: ['Employment verification', 'Income proof'],
      kiva: ['Community endorsement', 'Business plan'],
      local_mfi: ['Collateral documentation', 'Local guarantor']
    };

    return [...commonRequirements, ...(lenderSpecificRequirements[lenderKey] || [])];
  }

  async getInsuranceQuotes(
    farmerId: string, 
    type: 'crop' | 'livestock' | 'weather' | 'life',
    coverage: number
  ): Promise<InsurancePolicy[]> {
    const quotes: InsurancePolicy[] = [];

    for (const [key, provider] of Object.entries(this.insuranceProviders)) {
      if (provider.types.includes(type)) {
        try {
          const quote = await this.getInsuranceQuote(key, provider, type, coverage);
          if (quote) quotes.push(quote);
        } catch (error) {
          console.error(`Failed to get quote from ${provider.name}:`, error);
        }
      }
    }

    return quotes.sort((a, b) => a.premium - b.premium);
  }

  private async getInsuranceQuote(
    providerKey: string,
    provider: any,
    type: string,
    coverage: number
  ): Promise<InsurancePolicy | null> {
    const basePremiumRates: Record<string, number> = {
      crop: 0.05,      // 5% of coverage
      livestock: 0.08, // 8% of coverage
      weather: 0.03,   // 3% of coverage
      life: 0.02       // 2% of coverage
    };

    const premium = coverage * (basePremiumRates[type] || 0.05);

    return {
      provider: provider.name,
      type: type as any,
      coverage,
      premium,
      duration: 12, // months
      conditions: this.getInsuranceConditions(type),
      policyId: `${providerKey}_${type}_${Date.now()}`
    };
  }

  private getInsuranceConditions(type: string): string[] {
    const conditions: Record<string, string[]> = {
      crop: [
        'Coverage applies to weather-related losses',
        'Minimum 70% crop loss required for claim',
        'Farm inspection required before policy activation'
      ],
      livestock: [
        'Animals must be healthy at policy start',
        'Vaccination records required',
        'Death certificate from veterinarian needed for claims'
      ],
      weather: [
        'Parametric insurance based on weather data',
        'Automatic payouts when triggers are met',
        'No loss assessment required'
      ],
      life: [
        'Medical examination may be required',
        'Beneficiary designation required',
        'Premium payments must be current'
      ]
    };

    return conditions[type] || [];
  }

  async getCurrentMarketPrices(commodity: string, location: string): Promise<MarketPrice> {
    try {
      const [eagcData, localData] = await Promise.allSettled([
        this.getEAGCPrices(commodity, location),
        this.getLocalMarketPrices(commodity, location)
      ]);

      const prices = {
        wholesale: eagcData.status === 'fulfilled' ? eagcData.value.wholesale : undefined,
        retail: localData.status === 'fulfilled' ? localData.value.retail : undefined,
        farmgate: localData.status === 'fulfilled' ? localData.value.farmgate : undefined
      };

      const trends = await this.getPriceTrends(commodity, location, 30);
      const forecast = await this.getPriceForecast(commodity, location);

      return {
        commodity,
        location,
        prices,
        currency: 'KES', // Default to Kenyan Shillings
        unit: 'kg',
        trends,
        lastUpdated: new Date().toISOString(),
        forecast
      };
    } catch (error) {
      console.error('Failed to get market prices:', error);
      throw error;
    }
  }

  private async getEAGCPrices(commodity: string, location: string): Promise<any> {
    return {
      wholesale: this.generateMockPrice(commodity, 'wholesale'),
      lastUpdated: new Date().toISOString()
    };
  }

  private async getLocalMarketPrices(commodity: string, location: string): Promise<any> {
    return {
      retail: this.generateMockPrice(commodity, 'retail'),
      farmgate: this.generateMockPrice(commodity, 'farmgate'),
      lastUpdated: new Date().toISOString()
    };
  }

  private generateMockPrice(commodity: string, priceType: string): number {
    const basePrices: Record<string, number> = {
      maize: 45,
      beans: 120,
      tomatoes: 80,
      onions: 60,
      potatoes: 50,
      rice: 90,
      wheat: 55
    };

    const multipliers: Record<string, number> = {
      farmgate: 0.7,
      wholesale: 0.85,
      retail: 1.2
    };

    const basePrice = basePrices[commodity.toLowerCase()] || 50;
    const multiplier = multipliers[priceType] || 1;
    
    const variation = 0.9 + Math.random() * 0.2;
    
    return Math.round(basePrice * multiplier * variation);
  }

  private async getPriceTrends(commodity: string, location: string, days: number): Promise<PriceTrend[]> {
    const trends: PriceTrend[] = [];
    const currentPrice = this.generateMockPrice(commodity, 'wholesale');
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const variation = 0.95 + Math.random() * 0.1; // ±5% variation
      const price = Math.round(currentPrice * variation);
      const previousPrice = i === days ? price : trends[trends.length - 1]?.price || price;
      const change = price - previousPrice;
      const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;
      
      trends.push({
        date: date.toISOString().split('T')[0],
        price,
        change,
        changePercent: Math.round(changePercent * 100) / 100
      });
    }
    
    return trends;
  }

  private async getPriceForecast(commodity: string, location: string): Promise<PriceForecast[]> {
    const forecast: PriceForecast[] = [];
    const currentPrice = this.generateMockPrice(commodity, 'wholesale');
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const seasonalFactor = 1 + 0.1 * Math.sin((i / 30) * Math.PI);
      const trendFactor = 1 + (Math.random() - 0.5) * 0.05; // Small random trend
      const predictedPrice = Math.round(currentPrice * seasonalFactor * trendFactor);
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        predictedPrice,
        confidence: Math.max(0.6, 0.9 - (i / 30) * 0.3), // Confidence decreases over time
        factors: ['Seasonal demand', 'Weather patterns', 'Market trends']
      });
    }
    
    return forecast;
  }

  private async assessWeatherRisk(farmerId: string): Promise<number> {
    return 0.3 + Math.random() * 0.4; // Random risk between 0.3 and 0.7
  }

  private async assessPriceVolatility(cropType: string): Promise<number> {
    const volatilityMap: Record<string, number> = {
      tomatoes: 0.4,
      onions: 0.35,
      maize: 0.2,
      beans: 0.25,
      rice: 0.15
    };
    
    return volatilityMap[cropType.toLowerCase()] || 0.25;
  }

  async getLoanStatus(loanId: string): Promise<any> {
    return {
      loanId,
      status: 'approved',
      disbursementDate: new Date().toISOString(),
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      remainingBalance: 45000,
      paymentsRemaining: 11
    };
  }

  async processLoanPayment(loanId: string, amount: number, paymentMethod: string): Promise<any> {
    return {
      paymentId: `pay_${Date.now()}`,
      loanId,
      amount,
      paymentMethod,
      status: 'completed',
      transactionDate: new Date().toISOString()
    };
  }
}

export const comprehensiveFinanceService = new ComprehensiveFinanceService();
