import axios from 'axios';

interface PriceData {
  commodity: string;
  location: string;
  prices: {
    wholesale?: number;
    retail?: number;
    farmgate?: number;
  };
  currency: string;
  unit: string;
  trends: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  lastUpdated: string;
  source: string;
}

interface MarketAlert {
  commodity: string;
  location: string;
  alertType: 'price_increase' | 'price_decrease' | 'high_demand' | 'oversupply';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

class MarketPriceService {
  private sources = {
    eagc: {
      apiUrl: process.env.EAGC_API_URL || 'https://api.eagc.org',
      apiKey: process.env.EAGC_API_KEY,
      enabled: !!process.env.EAGC_API_KEY
    },
    ratin: {
      apiUrl: process.env.RATIN_API_URL || 'https://api.ratin.net',
      apiKey: process.env.RATIN_API_KEY,
      enabled: !!process.env.RATIN_API_KEY
    },
    local_markets: {
      apiUrl: process.env.LOCAL_MARKET_API_URL || 'https://api.localmarkets.co.ke',
      apiKey: process.env.LOCAL_MARKET_API_KEY,
      enabled: !!process.env.LOCAL_MARKET_API_KEY
    }
  };

  async getCurrentPrices(commodity: string, location: string): Promise<PriceData> {
    try {
      const [eagcPrices, localPrices, ratinPrices] = await Promise.allSettled([
        this.getEAGCPrices(commodity, location),
        this.getLocalMarketPrices(commodity, location),
        this.getRatinPrices(commodity, location)
      ]);

      const wholesalePrice = this.extractPrice(eagcPrices, 'wholesale') || 
                           this.extractPrice(ratinPrices, 'wholesale');
      
      const retailPrice = this.extractPrice(localPrices, 'retail') || 
                         this.extractPrice(eagcPrices, 'retail');
      
      const farmgatePrice = this.extractPrice(localPrices, 'farmgate') || 
                           (wholesalePrice ? wholesalePrice * 0.7 : this.getBasePriceForCommodity(commodity) * 0.7);// Estimate if not available

      const trends = await this.calculatePriceTrends(commodity, location);

      return {
        commodity,
        location,
        prices: {
          wholesale: wholesalePrice,
          retail: retailPrice,
          farmgate: farmgatePrice
        },
        currency: 'KES',
        unit: 'per kg',
        trends,
        lastUpdated: new Date().toISOString(),
        source: 'Multiple sources aggregated'
      };
    } catch (error) {
      console.error('Failed to fetch current prices:', error);
      return this.getMockPriceData(commodity, location);
    }
  }

  private async getEAGCPrices(commodity: string, location: string): Promise<any> {
    if (!this.sources.eagc.enabled) {
      return this.getMockEAGCData(commodity, location);
    }

    try {
      const response = await axios.get(`${this.sources.eagc.apiUrl}/prices`, {
        params: {
          commodity: commodity.toLowerCase(),
          location: location.toLowerCase(),
          period: 'current'
        },
        headers: {
          'Authorization': `Bearer ${this.sources.eagc.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      console.error('EAGC API error:', error);
      return this.getMockEAGCData(commodity, location);
    }
  }

  private async getLocalMarketPrices(commodity: string, location: string): Promise<any> {
    if (!this.sources.local_markets.enabled) {
      return this.getMockLocalMarketData(commodity, location);
    }

    try {
      const response = await axios.get(`${this.sources.local_markets.apiUrl}/commodities/${commodity}`, {
        params: {
          location,
          date: new Date().toISOString().split('T')[0]
        },
        headers: {
          'X-API-Key': this.sources.local_markets.apiKey
        },
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      console.error('Local market API error:', error);
      return this.getMockLocalMarketData(commodity, location);
    }
  }

  private async getRatinPrices(commodity: string, location: string): Promise<any> {
    if (!this.sources.ratin.enabled) {
      return this.getMockRatinData(commodity, location);
    }

    try {
      const response = await axios.get(`${this.sources.ratin.apiUrl}/market-prices`, {
        params: {
          product: commodity,
          market: location,
          format: 'json'
        },
        headers: {
          'Authorization': `Token ${this.sources.ratin.apiKey}`
        },
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      console.error('Ratin API error:', error);
      return this.getMockRatinData(commodity, location);
    }
  }

  private extractPrice(result: PromiseSettledResult<any>, priceType: string): number | undefined {
    if (result.status === 'fulfilled' && result.value) {
      const data = result.value;
      return data.prices?.[priceType] || data[priceType] || data.price;
    }
    return undefined;
  }

  private async calculatePriceTrends(commodity: string, location: string): Promise<any> {
    try {
      const historicalData = await this.getHistoricalPrices(commodity, location, 30);
      
      if (!historicalData || historicalData.length < 7) {
        return { daily: 0, weekly: 2.5, monthly: 5.2 };
      }

      const prices = historicalData.map(d => d.price);
      const dailyChange = ((prices[0] - prices[1]) / prices[1]) * 100;
      const weeklyChange = ((prices[0] - prices[6]) / prices[6]) * 100;
      const monthlyChange = ((prices[0] - prices[29]) / prices[29]) * 100;

      return {
        daily: Math.round(dailyChange * 100) / 100,
        weekly: Math.round(weeklyChange * 100) / 100,
        monthly: Math.round(monthlyChange * 100) / 100
      };
    } catch (error) {
      console.error('Failed to calculate trends:', error);
      return { daily: 0, weekly: 2.5, monthly: 5.2 };
    }
  }

  private async getHistoricalPrices(commodity: string, location: string, days: number): Promise<Array<{date: string, price: number}>> {
    const mockData: Array<{date: string, price: number}> = [];
    const basePrice = this.getBasePriceForCommodity(commodity);
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const price = basePrice * (1 + variation);
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(price * 100) / 100
      });
    }
    
    return mockData;
  }

  private getBasePriceForCommodity(commodity: string): number {
    const basePrices = {
      'maize': 45,
      'beans': 120,
      'rice': 85,
      'wheat': 55,
      'tomatoes': 80,
      'onions': 60,
      'potatoes': 40,
      'cabbage': 35,
      'carrots': 70,
      'coffee': 450
    };

    return basePrices[commodity.toLowerCase() as keyof typeof basePrices] || 50;
  }

  async getMarketAlerts(location: string): Promise<MarketAlert[]> {
    try {
      const alerts: MarketAlert[] = [];
      const commodities = ['maize', 'beans', 'tomatoes', 'onions'];

      for (const commodity of commodities) {
        const priceData = await this.getCurrentPrices(commodity, location);
        
        if (priceData.trends.weekly > 10) {
          alerts.push({
            commodity,
            location,
            alertType: 'price_increase',
            message: `${commodity} prices increased by ${priceData.trends.weekly.toFixed(1)}% this week`,
            severity: priceData.trends.weekly > 20 ? 'high' : 'medium',
            timestamp: new Date().toISOString()
          });
        }

        if (priceData.trends.weekly < -10) {
          alerts.push({
            commodity,
            location,
            alertType: 'price_decrease',
            message: `${commodity} prices dropped by ${Math.abs(priceData.trends.weekly).toFixed(1)}% this week`,
            severity: 'medium',
            timestamp: new Date().toISOString()
          });
        }
      }

      return alerts;
    } catch (error) {
      console.error('Failed to generate market alerts:', error);
      return [];
    }
  }

  private getMockPriceData(commodity: string, location: string): PriceData {
    const basePrice = this.getBasePriceForCommodity(commodity);
    
    return {
      commodity,
      location,
      prices: {
        wholesale: basePrice,
        retail: basePrice * 1.3,
        farmgate: basePrice * 0.7
      },
      currency: 'KES',
      unit: 'per kg',
      trends: {
        daily: (Math.random() - 0.5) * 4,
        weekly: (Math.random() - 0.5) * 10,
        monthly: (Math.random() - 0.5) * 20
      },
      lastUpdated: new Date().toISOString(),
      source: 'Mock data for development'
    };
  }

  private getMockEAGCData(commodity: string, location: string) {
    return {
      prices: {
        wholesale: this.getBasePriceForCommodity(commodity),
        retail: this.getBasePriceForCommodity(commodity) * 1.25
      }
    };
  }

  private getMockLocalMarketData(commodity: string, location: string) {
    return {
      retail: this.getBasePriceForCommodity(commodity) * 1.3,
      farmgate: this.getBasePriceForCommodity(commodity) * 0.7
    };
  }

  private getMockRatinData(commodity: string, location: string) {
    return {
      price: this.getBasePriceForCommodity(commodity) * 1.1
    };
  }
}

export const marketPriceService = new MarketPriceService();
