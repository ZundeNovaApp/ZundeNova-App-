import Flutterwave from 'flutterwave-node-v3';

interface PaymentRequest {
  amount: number;
  currency: string;
  email: string;
  phoneNumber: string;
  paymentMethod: 'mpesa' | 'flutterwave' | 'paystack' | 'airtel' | 'mtn';
  orderId: string;
  description?: string;
}

interface PaymentResponse {
  success: boolean;
  transactionId: string;
  paymentUrl?: string;
  message: string;
  provider: string;
}

class PaymentService {
  private flutterwave: any;

  constructor() {
    this.flutterwave = new Flutterwave(
      process.env.FLUTTERWAVE_PUBLIC_KEY || 'demo-public-key',
      process.env.FLUTTERWAVE_SECRET_KEY || 'demo-secret-key'
    );
  }

  async processPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    const { amount, currency, email, phoneNumber, paymentMethod, orderId, description } = paymentData;

    try {
      switch (paymentMethod) {
        case 'mpesa':
          return await this.processMpesaPayment(amount, phoneNumber, orderId, description);
        
        case 'flutterwave':
          return await this.processFlutterwavePayment(amount, currency, email, orderId, description);
        
        case 'paystack':
          return await this.processPaystackPayment(amount, email, orderId, description);
        
        case 'airtel':
          return await this.processAirtelMoneyPayment(amount, phoneNumber, orderId, description);
        
        case 'mtn':
          return await this.processMTNMoMoPayment(amount, phoneNumber, orderId, description);
        
        default:
          throw new Error(`Unsupported payment method: ${paymentMethod}`);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        transactionId: '',
        message: `Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        provider: paymentMethod
      };
    }
  }

  private async processMpesaPayment(
    amount: number, 
    phoneNumber: string, 
    orderId: string, 
    description?: string
  ): Promise<PaymentResponse> {
    try {
      const payload = {
        tx_ref: `mpesa-${orderId}-${Date.now()}`,
        amount,
        currency: 'KES',
        network: 'MTN',
        phone_number: phoneNumber,
        email: 'customer@zundenova.com',
        meta: {
          orderId,
          description: description || 'ZundeNova agricultural products'
        },
        redirect_url: process.env.PAYMENT_REDIRECT_URL || 'https://zundenova.com/payment/callback'
      };

      const response = await this.flutterwave.MobileMoney.mpesa(payload);

      if (response.status === 'success') {
        return {
          success: true,
          transactionId: response.data.tx_ref,
          paymentUrl: response.data.link,
          message: 'M-Pesa payment initiated successfully. Check your phone for STK push.',
          provider: 'mpesa'
        };
      } else {
        throw new Error(response.message || 'M-Pesa payment failed');
      }
    } catch (error) {
      throw new Error(`M-Pesa payment error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processFlutterwavePayment(
    amount: number, 
    currency: string, 
    email: string, 
    orderId: string, 
    description?: string
  ): Promise<PaymentResponse> {
    try {
      const payload = {
        tx_ref: `fw-${orderId}-${Date.now()}`,
        amount,
        currency: currency.toUpperCase(),
        redirect_url: process.env.PAYMENT_REDIRECT_URL || 'https://zundenova.com/payment/callback',
        customer: {
          email,
          name: 'ZundeNova Customer'
        },
        customizations: {
          title: 'ZundeNova Payment',
          description: description || 'Agricultural products and services',
          logo: 'https://zundenova.com/logo.png'
        },
        meta: {
          orderId,
          source: 'zundenova-app'
        }
      };

      const response = await this.flutterwave.Payment.card(payload);

      if (response.status === 'success') {
        return {
          success: true,
          transactionId: response.data.tx_ref,
          paymentUrl: response.data.link,
          message: 'Flutterwave payment link generated successfully.',
          provider: 'flutterwave'
        };
      } else {
        throw new Error(response.message || 'Flutterwave payment failed');
      }
    } catch (error) {
      throw new Error(`Flutterwave payment error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processPaystackPayment(
    amount: number, 
    email: string, 
    orderId: string, 
    description?: string
  ): Promise<PaymentResponse> {
    try {
      const paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY || 'demo-secret-key');

      const payload = {
        amount: amount * 100, // Paystack uses kobo (smallest currency unit)
        email,
        reference: `ps-${orderId}-${Date.now()}`,
        callback_url: process.env.PAYMENT_REDIRECT_URL || 'https://zundenova.com/payment/callback',
        metadata: {
          orderId,
          description: description || 'ZundeNova agricultural products',
          source: 'zundenova-app'
        }
      };

      const response = await paystack.transaction.initialize(payload);

      if (response.status) {
        return {
          success: true,
          transactionId: response.data.reference,
          paymentUrl: response.data.authorization_url,
          message: 'Paystack payment link generated successfully.',
          provider: 'paystack'
        };
      } else {
        throw new Error(response.message || 'Paystack payment failed');
      }
    } catch (error) {
      throw new Error(`Paystack payment error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processAirtelMoneyPayment(
    amount: number, 
    phoneNumber: string, 
    orderId: string, 
    description?: string
  ): Promise<PaymentResponse> {
    try {
      const payload = {
        tx_ref: `airtel-${orderId}-${Date.now()}`,
        amount,
        currency: 'UGX', // Default to Uganda Shillings for Airtel
        network: 'AIRTEL',
        phone_number: phoneNumber,
        email: 'customer@zundenova.com',
        meta: {
          orderId,
          description: description || 'ZundeNova agricultural products'
        }
      };

      const response = await this.flutterwave.MobileMoney.uganda(payload);

      if (response.status === 'success') {
        return {
          success: true,
          transactionId: response.data.tx_ref,
          message: 'Airtel Money payment initiated successfully. Check your phone for confirmation.',
          provider: 'airtel'
        };
      } else {
        throw new Error(response.message || 'Airtel Money payment failed');
      }
    } catch (error) {
      throw new Error(`Airtel Money payment error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processMTNMoMoPayment(
    amount: number, 
    phoneNumber: string, 
    orderId: string, 
    description?: string
  ): Promise<PaymentResponse> {
    try {
      const payload = {
        tx_ref: `mtn-${orderId}-${Date.now()}`,
        amount,
        currency: 'UGX', // Default to Uganda Shillings for MTN
        network: 'MTN',
        phone_number: phoneNumber,
        email: 'customer@zundenova.com',
        meta: {
          orderId,
          description: description || 'ZundeNova agricultural products'
        }
      };

      const response = await this.flutterwave.MobileMoney.uganda(payload);

      if (response.status === 'success') {
        return {
          success: true,
          transactionId: response.data.tx_ref,
          message: 'MTN Mobile Money payment initiated successfully. Check your phone for confirmation.',
          provider: 'mtn'
        };
      } else {
        throw new Error(response.message || 'MTN Mobile Money payment failed');
      }
    } catch (error) {
      throw new Error(`MTN Mobile Money payment error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async verifyPayment(transactionId: string, provider: string): Promise<any> {
    try {
      switch (provider) {
        case 'flutterwave':
        case 'mpesa':
        case 'airtel':
        case 'mtn':
          const response = await this.flutterwave.Transaction.verify({ id: transactionId });
          return {
            success: response.status === 'success',
            data: response.data,
            message: response.message
          };

        case 'paystack':
          const paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);
          const paystackResponse = await paystack.transaction.verify(transactionId);
          return {
            success: paystackResponse.status,
            data: paystackResponse.data,
            message: paystackResponse.message
          };

        default:
          throw new Error(`Unsupported payment provider: ${provider}`);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        message: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async processRefund(transactionId: string, amount: number, provider: string): Promise<any> {
    try {
      switch (provider) {
        case 'flutterwave':
        case 'mpesa':
        case 'airtel':
        case 'mtn':
          const response = await this.flutterwave.Transaction.refund({
            id: transactionId,
            amount
          });
          return {
            success: response.status === 'success',
            data: response.data,
            message: response.message
          };

        case 'paystack':
          const paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);
          const paystackResponse = await paystack.refund.create({
            transaction: transactionId,
            amount: amount * 100 // Convert to kobo
          });
          return {
            success: paystackResponse.status,
            data: paystackResponse.data,
            message: paystackResponse.message
          };

        default:
          throw new Error(`Refunds not supported for provider: ${provider}`);
      }
    } catch (error) {
      console.error('Refund processing error:', error);
      return {
        success: false,
        message: `Refund failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async getPaymentMethods(country: string = 'KE'): Promise<string[]> {
    const methodsByCountry = {
      'KE': ['mpesa', 'flutterwave', 'paystack'], // Kenya
      'UG': ['airtel', 'mtn', 'flutterwave'], // Uganda
      'TZ': ['mpesa', 'airtel', 'flutterwave'], // Tanzania
      'NG': ['paystack', 'flutterwave'], // Nigeria
      'GH': ['mtn', 'flutterwave'], // Ghana
      'ZA': ['paystack', 'flutterwave'] // South Africa
    };

    return methodsByCountry[country as keyof typeof methodsByCountry] || ['flutterwave'];
  }

  async getTransactionHistory(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const mockTransactions = [
        {
          id: 'tx_001',
          amount: 1500,
          currency: 'KES',
          status: 'completed',
          provider: 'mpesa',
          description: 'Maize seeds purchase',
          createdAt: new Date('2024-01-10'),
          orderId: 'ord_123'
        },
        {
          id: 'tx_002',
          amount: 3500,
          currency: 'KES',
          status: 'completed',
          provider: 'flutterwave',
          description: 'Fertilizer DAP 50kg',
          createdAt: new Date('2024-01-08'),
          orderId: 'ord_124'
        },
        {
          id: 'tx_003',
          amount: 800,
          currency: 'KES',
          status: 'pending',
          provider: 'mpesa',
          description: 'Pesticide spray',
          createdAt: new Date('2024-01-12'),
          orderId: 'ord_125'
        }
      ];

      return mockTransactions.slice(0, limit);
    } catch (error) {
      console.error('Transaction history error:', error);
      return [];
    }
  }

  async calculateTransactionFee(amount: number, paymentMethod: string): Promise<number> {
    const feeStructures = {
      mpesa: {
        percentage: 0.015, // 1.5%
        minimum: 10,
        maximum: 100
      },
      flutterwave: {
        percentage: 0.014, // 1.4%
        minimum: 5,
        maximum: 200
      },
      paystack: {
        percentage: 0.015, // 1.5%
        minimum: 10,
        maximum: 200
      },
      airtel: {
        percentage: 0.02, // 2%
        minimum: 15,
        maximum: 150
      },
      mtn: {
        percentage: 0.02, // 2%
        minimum: 15,
        maximum: 150
      }
    };

    const feeStructure = feeStructures[paymentMethod as keyof typeof feeStructures];
    if (!feeStructure) {
      return 0;
    }

    const calculatedFee = amount * feeStructure.percentage;
    return Math.max(
      feeStructure.minimum,
      Math.min(calculatedFee, feeStructure.maximum)
    );
  }
}

export const paymentService = new PaymentService();
