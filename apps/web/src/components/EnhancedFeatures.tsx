'use client';

import React, { useState, useEffect } from 'react';

interface LoanApplication {
  farmerId: string;
  amount: number;
  purpose: string;
  phoneNumber: string;
  creditScore: number;
  term: string;
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
  trends: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

interface DeliveryQuote {
  provider: string;
  price: number;
  currency: string;
  estimatedTime: string;
  serviceType: string;
  features: string[];
}

export default function EnhancedFeatures() {
  const [activeTab, setActiveTab] = useState('loans');
  const [loanResults, setLoanResults] = useState<any[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice | null>(null);
  const [deliveryQuotes, setDeliveryQuotes] = useState<DeliveryQuote[]>([]);
  const [loading, setLoading] = useState(false);

  const testMicroLoans = async () => {
    setLoading(true);
    try {
      const application: LoanApplication = {
        farmerId: 'farmer_123',
        amount: 2000,
        purpose: 'Seeds and fertilizer',
        phoneNumber: '+254700000000',
        creditScore: 75,
        term: '6 months'
      };

      const response = await fetch('/api/enhanced/micro-loans/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(application)
      });

      const data = await response.json();
      setLoanResults(data.results || []);
    } catch (error) {
      console.error('Loan application failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const testMarketPrices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/enhanced/market-prices/maize/nairobi');
      const data = await response.json();
      setMarketPrices(data);
    } catch (error) {
      console.error('Market prices failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const testLogistics = async () => {
    setLoading(true);
    try {
      const deliveryRequest = {
        pickup: {
          address: 'Nairobi CBD',
          coordinates: { lat: -1.2921, lng: 36.8219 },
          contactName: 'John Farmer',
          contactPhone: '+254700000000'
        },
        delivery: {
          address: 'Mombasa Port',
          coordinates: { lat: -4.0435, lng: 39.6682 },
          contactName: 'Port Authority',
          contactPhone: '+254700000001'
        },
        packageSize: 'large' as const,
        weight: 50,
        description: 'Agricultural produce',
        urgency: 'standard' as const
      };

      const response = await fetch('/api/enhanced/logistics/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deliveryRequest)
      });

      const data = await response.json();
      setDeliveryQuotes(data || []);
    } catch (error) {
      console.error('Logistics quote failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const testBlockchain = async () => {
    setLoading(true);
    try {
      const animalData = {
        uniqueId: `animal_${Date.now()}`,
        breed: 'Holstein',
        birthDate: '2023-01-15',
        farmerId: 'farmer_123',
        metadata: {
          weight: 450,
          color: 'Black and White',
          vaccinations: ['FMD', 'Anthrax']
        }
      };

      const response = await fetch('/api/enhanced/blockchain/register-animal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(animalData)
      });

      const data = await response.json();
      console.log('Blockchain registration:', data);
    } catch (error) {
      console.error('Blockchain registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderLoans = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Micro-Lending Integration</h3>
        <button
          onClick={testMicroLoans}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Test Loan Application'}
        </button>
      </div>

      {loanResults.length > 0 && (
        <div className="grid gap-4">
          {loanResults.map((result, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-green-600">{result.lender}</h4>
                <span className={`px-2 py-1 rounded text-sm ${
                  result.status === 'approved' ? 'bg-green-100 text-green-800' :
                  result.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {result.status}
                </span>
              </div>
              {result.status === 'approved' && (
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Interest Rate: {result.interestRate}%</p>
                  <p>Monthly Payment: ${result.monthlyPayment}</p>
                  <p>Processing Time: {result.processingTime}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMarketPrices = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Market Price Tracking</h3>
        <button
          onClick={testMarketPrices}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get Market Prices'}
        </button>
      </div>

      {marketPrices && (
        <div className="bg-white p-4 rounded-lg shadow border">
          <h4 className="font-semibold mb-3">{marketPrices.commodity} - {marketPrices.location}</h4>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Wholesale</p>
              <p className="text-lg font-semibold">{marketPrices.currency} {marketPrices.prices.wholesale}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Retail</p>
              <p className="text-lg font-semibold">{marketPrices.currency} {marketPrices.prices.retail}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Farmgate</p>
              <p className="text-lg font-semibold">{marketPrices.currency} {marketPrices.prices.farmgate}</p>
            </div>
          </div>
          <div className="border-t pt-3">
            <p className="text-sm text-gray-600 mb-2">Price Trends</p>
            <div className="flex space-x-4 text-sm">
              <span className={`${marketPrices.trends.daily >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Daily: {marketPrices.trends.daily > 0 ? '+' : ''}{marketPrices.trends.daily.toFixed(1)}%
              </span>
              <span className={`${marketPrices.trends.weekly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Weekly: {marketPrices.trends.weekly > 0 ? '+' : ''}{marketPrices.trends.weekly.toFixed(1)}%
              </span>
              <span className={`${marketPrices.trends.monthly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Monthly: {marketPrices.trends.monthly > 0 ? '+' : ''}{marketPrices.trends.monthly.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderLogistics = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Logistics Integration</h3>
        <button
          onClick={testLogistics}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get Delivery Quotes'}
        </button>
      </div>

      {deliveryQuotes.length > 0 && (
        <div className="grid gap-4">
          {deliveryQuotes.map((quote, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-purple-600">{quote.provider}</h4>
                <div className="text-right">
                  <p className="font-semibold">{quote.currency} {quote.price}</p>
                  <p className="text-sm text-gray-600">{quote.estimatedTime}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{quote.serviceType}</p>
              <div className="flex flex-wrap gap-1">
                {quote.features.map((feature, idx) => (
                  <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderBlockchain = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Blockchain Traceability</h3>
        <button
          onClick={testBlockchain}
          disabled={loading}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Register Animal'}
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border">
        <h4 className="font-semibold mb-3">Blockchain Features</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <p>✅ Animal registration and ownership tracking</p>
          <p>✅ Health record immutable logging</p>
          <p>✅ Produce batch traceability</p>
          <p>✅ Quality certification verification</p>
          <p>✅ QR code generation for verification</p>
          <p className="text-orange-600 font-medium">Currently running in mock mode for development</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced ZundeNova Features</h1>
        <p className="text-gray-600">Test the comprehensive platform enhancements</p>
      </div>

      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'loans', label: 'Micro-Loans', icon: '💰' },
          { id: 'prices', label: 'Market Prices', icon: '📈' },
          { id: 'logistics', label: 'Logistics', icon: '🚚' },
          { id: 'blockchain', label: 'Blockchain', icon: '🔗' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        {activeTab === 'loans' && renderLoans()}
        {activeTab === 'prices' && renderMarketPrices()}
        {activeTab === 'logistics' && renderLogistics()}
        {activeTab === 'blockchain' && renderBlockchain()}
      </div>
    </div>
  );
}
