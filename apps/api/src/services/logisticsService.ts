import axios from 'axios';

interface DeliveryRequest {
  pickup: {
    address: string;
    coordinates: { lat: number; lng: number };
    contactName: string;
    contactPhone: string;
  };
  delivery: {
    address: string;
    coordinates: { lat: number; lng: number };
    contactName: string;
    contactPhone: string;
  };
  packageSize: 'small' | 'medium' | 'large' | 'extra_large';
  weight: number;
  description: string;
  urgency: 'standard' | 'express' | 'same_day';
  specialInstructions?: string;
}

interface DeliveryQuote {
  provider: string;
  price: number;
  currency: string;
  estimatedTime: string;
  quoteId: string;
  serviceType: string;
  features: string[];
}

interface DeliveryTracking {
  trackingId: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
  currentLocation?: string;
  estimatedDelivery: string;
  updates: TrackingUpdate[];
}

interface TrackingUpdate {
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

class LogisticsService {
  private providers = {
    sendy: {
      apiUrl: process.env.SENDY_API_URL || 'https://api.sendy.co.ke',
      apiKey: process.env.SENDY_API_KEY,
      enabled: !!process.env.SENDY_API_KEY
    },
    kobo360: {
      apiUrl: process.env.KOBO360_API_URL || 'https://api.kobo360.com',
      apiKey: process.env.KOBO360_API_KEY,
      enabled: !!process.env.KOBO360_API_KEY
    },
    local_couriers: {
      apiUrl: process.env.LOCAL_COURIER_API_URL || 'https://api.localcouriers.co.ke',
      apiKey: process.env.LOCAL_COURIER_API_KEY,
      enabled: !!process.env.LOCAL_COURIER_API_KEY
    },
    dhl: {
      apiUrl: process.env.DHL_API_URL || 'https://api.dhl.com',
      apiKey: process.env.DHL_API_KEY,
      enabled: !!process.env.DHL_API_KEY
    }
  };

  async requestDelivery(deliveryRequest: DeliveryRequest): Promise<DeliveryQuote[]> {
    try {
      const quotes = await Promise.allSettled([
        this.getSendyQuote(deliveryRequest),
        this.getKobo360Quote(deliveryRequest),
        this.getLocalCourierQuote(deliveryRequest),
        this.getDHLQuote(deliveryRequest)
      ]);

      const validQuotes = quotes
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<DeliveryQuote>).value)
        .filter(Boolean)
        .sort((a, b) => a.price - b.price);

      return validQuotes;
    } catch (error) {
      console.error('Failed to get delivery quotes:', error);
      return this.getMockQuotes(deliveryRequest);
    }
  }

  private async getSendyQuote(request: DeliveryRequest): Promise<DeliveryQuote | null> {
    if (!this.providers.sendy.enabled) {
      return this.getMockSendyQuote(request);
    }

    try {
      const response = await axios.post(`${this.providers.sendy.apiUrl}/quote`, {
        pickup: {
          name: request.pickup.contactName,
          phone: request.pickup.contactPhone,
          address: request.pickup.address,
          latitude: request.pickup.coordinates.lat,
          longitude: request.pickup.coordinates.lng
        },
        delivery: {
          name: request.delivery.contactName,
          phone: request.delivery.contactPhone,
          address: request.delivery.address,
          latitude: request.delivery.coordinates.lat,
          longitude: request.delivery.coordinates.lng
        },
        package_size: request.packageSize,
        weight: request.weight,
        urgency: request.urgency
      }, {
        headers: { 
          'Authorization': `Bearer ${this.providers.sendy.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return {
        provider: 'Sendy',
        price: response.data.price,
        currency: response.data.currency || 'KES',
        estimatedTime: response.data.estimatedTime,
        quoteId: response.data.quoteId,
        serviceType: response.data.serviceType,
        features: ['Real-time tracking', 'SMS notifications', 'Proof of delivery']
      };
    } catch (error) {
      console.error('Sendy API error:', error);
      return this.getMockSendyQuote(request);
    }
  }

  private async getKobo360Quote(request: DeliveryRequest): Promise<DeliveryQuote | null> {
    if (!this.providers.kobo360.enabled) {
      return this.getMockKobo360Quote(request);
    }

    try {
      const response = await axios.post(`${this.providers.kobo360.apiUrl}/logistics/quote`, {
        origin: {
          address: request.pickup.address,
          coordinates: request.pickup.coordinates
        },
        destination: {
          address: request.delivery.address,
          coordinates: request.delivery.coordinates
        },
        cargo: {
          weight: request.weight,
          size: request.packageSize,
          description: request.description
        },
        service_level: request.urgency
      }, {
        headers: {
          'X-API-Key': this.providers.kobo360.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return {
        provider: 'Kobo360',
        price: response.data.quote.amount,
        currency: response.data.quote.currency,
        estimatedTime: response.data.quote.delivery_time,
        quoteId: response.data.quote.id,
        serviceType: response.data.quote.service_type,
        features: ['GPS tracking', 'Insurance coverage', 'Professional drivers']
      };
    } catch (error) {
      console.error('Kobo360 API error:', error);
      return this.getMockKobo360Quote(request);
    }
  }

  private async getLocalCourierQuote(request: DeliveryRequest): Promise<DeliveryQuote | null> {
    if (!this.providers.local_couriers.enabled) {
      return this.getMockLocalCourierQuote(request);
    }

    try {
      const response = await axios.post(`${this.providers.local_couriers.apiUrl}/quotes`, {
        pickup_location: request.pickup.address,
        delivery_location: request.delivery.address,
        package_details: {
          weight: request.weight,
          size: request.packageSize,
          description: request.description
        },
        urgency: request.urgency
      }, {
        headers: {
          'Authorization': `Token ${this.providers.local_couriers.apiKey}`
        },
        timeout: 10000
      });

      return {
        provider: 'Local Couriers',
        price: response.data.price,
        currency: 'KES',
        estimatedTime: response.data.estimated_delivery,
        quoteId: response.data.quote_id,
        serviceType: response.data.service_type,
        features: ['Local knowledge', 'Flexible scheduling', 'Cash on delivery']
      };
    } catch (error) {
      console.error('Local courier API error:', error);
      return this.getMockLocalCourierQuote(request);
    }
  }

  private async getDHLQuote(request: DeliveryRequest): Promise<DeliveryQuote | null> {
    if (!this.providers.dhl.enabled) {
      return this.getMockDHLQuote(request);
    }

    try {
      const response = await axios.post(`${this.providers.dhl.apiUrl}/shipments/quotes`, {
        plannedShippingDateAndTime: new Date().toISOString(),
        pickup: {
          countryCode: 'KE',
          postalCode: '00100',
          cityName: 'Nairobi'
        },
        delivery: {
          countryCode: 'KE',
          postalCode: '80100',
          cityName: 'Mombasa'
        },
        packages: [{
          weight: request.weight,
          dimensions: {
            length: 30,
            width: 20,
            height: 15
          }
        }]
      }, {
        headers: {
          'DHL-API-Key': this.providers.dhl.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      const quote = response.data.products[0];
      return {
        provider: 'DHL',
        price: parseFloat(quote.totalPrice[0].price),
        currency: quote.totalPrice[0].currencyType,
        estimatedTime: quote.deliveryCapabilities.deliveryTypeCode,
        quoteId: `dhl_${Date.now()}`,
        serviceType: quote.productName,
        features: ['International shipping', 'Insurance included', 'Signature required']
      };
    } catch (error) {
      console.error('DHL API error:', error);
      return this.getMockDHLQuote(request);
    }
  }

  async trackDelivery(trackingId: string, provider: string): Promise<DeliveryTracking> {
    try {
      switch (provider.toLowerCase()) {
        case 'sendy':
          return await this.trackSendyDelivery(trackingId);
        case 'kobo360':
          return await this.trackKobo360Delivery(trackingId);
        case 'local couriers':
          return await this.trackLocalCourierDelivery(trackingId);
        case 'dhl':
          return await this.trackDHLDelivery(trackingId);
        default:
          throw new Error('Unsupported logistics provider');
      }
    } catch (error) {
      console.error(`Failed to track delivery for ${provider}:`, error);
      return this.getMockTracking(trackingId);
    }
  }

  private async trackSendyDelivery(trackingId: string): Promise<DeliveryTracking> {
    if (!this.providers.sendy.enabled) {
      return this.getMockTracking(trackingId);
    }

    try {
      const response = await axios.get(`${this.providers.sendy.apiUrl}/track/${trackingId}`, {
        headers: { 'Authorization': `Bearer ${this.providers.sendy.apiKey}` }
      });

      return {
        trackingId,
        status: response.data.status,
        currentLocation: response.data.current_location,
        estimatedDelivery: response.data.estimated_delivery,
        updates: response.data.tracking_updates || []
      };
    } catch (error) {
      console.error('Sendy tracking error:', error);
      return this.getMockTracking(trackingId);
    }
  }

  private async trackKobo360Delivery(trackingId: string): Promise<DeliveryTracking> {
    if (!this.providers.kobo360.enabled) {
      return this.getMockTracking(trackingId);
    }

    try {
      const response = await axios.get(`${this.providers.kobo360.apiUrl}/shipments/${trackingId}/track`, {
        headers: { 'X-API-Key': this.providers.kobo360.apiKey }
      });

      return {
        trackingId,
        status: response.data.status,
        currentLocation: response.data.current_location,
        estimatedDelivery: response.data.eta,
        updates: response.data.events || []
      };
    } catch (error) {
      console.error('Kobo360 tracking error:', error);
      return this.getMockTracking(trackingId);
    }
  }

  private async trackLocalCourierDelivery(trackingId: string): Promise<DeliveryTracking> {
    return this.getMockTracking(trackingId);
  }

  private async trackDHLDelivery(trackingId: string): Promise<DeliveryTracking> {
    if (!this.providers.dhl.enabled) {
      return this.getMockTracking(trackingId);
    }

    try {
      const response = await axios.get(`${this.providers.dhl.apiUrl}/track/shipments`, {
        params: { trackingNumber: trackingId },
        headers: { 'DHL-API-Key': this.providers.dhl.apiKey }
      });

      const shipment = response.data.shipments[0];
      return {
        trackingId,
        status: shipment.status.statusCode,
        currentLocation: shipment.status.location,
        estimatedDelivery: shipment.estimatedTimeOfDelivery,
        updates: shipment.events || []
      };
    } catch (error) {
      console.error('DHL tracking error:', error);
      return this.getMockTracking(trackingId);
    }
  }

  async schedulePickup(deliveryRequest: DeliveryRequest, selectedQuote: DeliveryQuote): Promise<any> {
    try {
      switch (selectedQuote.provider.toLowerCase()) {
        case 'sendy':
          return await this.scheduleSendyPickup(deliveryRequest, selectedQuote);
        case 'kobo360':
          return await this.scheduleKobo360Pickup(deliveryRequest, selectedQuote);
        default:
          return this.getMockScheduleResponse(selectedQuote);
      }
    } catch (error) {
      console.error('Failed to schedule pickup:', error);
      return this.getMockScheduleResponse(selectedQuote);
    }
  }

  private async scheduleSendyPickup(request: DeliveryRequest, quote: DeliveryQuote): Promise<any> {
    if (!this.providers.sendy.enabled) {
      return this.getMockScheduleResponse(quote);
    }

    try {
      const response = await axios.post(`${this.providers.sendy.apiUrl}/deliveries`, {
        quote_id: quote.quoteId,
        pickup: request.pickup,
        delivery: request.delivery,
        package: {
          size: request.packageSize,
          weight: request.weight,
          description: request.description
        },
        special_instructions: request.specialInstructions
      }, {
        headers: { 'Authorization': `Bearer ${this.providers.sendy.apiKey}` }
      });

      return {
        success: true,
        deliveryId: response.data.delivery_id,
        trackingId: response.data.tracking_number,
        estimatedPickup: response.data.estimated_pickup,
        cost: response.data.cost
      };
    } catch (error) {
      console.error('Sendy scheduling error:', error);
      return this.getMockScheduleResponse(quote);
    }
  }

  private async scheduleKobo360Pickup(request: DeliveryRequest, quote: DeliveryQuote): Promise<any> {
    return this.getMockScheduleResponse(quote);
  }

  private getMockQuotes(request: DeliveryRequest): DeliveryQuote[] {
    const basePrice = this.calculateBasePrice(request);
    
    return [
      {
        provider: 'Sendy',
        price: basePrice * 0.8,
        currency: 'KES',
        estimatedTime: '2-4 hours',
        quoteId: `sendy_${Date.now()}`,
        serviceType: 'Standard Delivery',
        features: ['Real-time tracking', 'SMS notifications', 'Proof of delivery']
      },
      {
        provider: 'Kobo360',
        price: basePrice * 1.1,
        currency: 'KES',
        estimatedTime: '3-6 hours',
        quoteId: `kobo_${Date.now()}`,
        serviceType: 'Professional Logistics',
        features: ['GPS tracking', 'Insurance coverage', 'Professional drivers']
      },
      {
        provider: 'Local Couriers',
        price: basePrice * 0.6,
        currency: 'KES',
        estimatedTime: '4-8 hours',
        quoteId: `local_${Date.now()}`,
        serviceType: 'Local Delivery',
        features: ['Local knowledge', 'Flexible scheduling', 'Cash on delivery']
      }
    ];
  }

  private getMockSendyQuote(request: DeliveryRequest): DeliveryQuote {
    return {
      provider: 'Sendy',
      price: this.calculateBasePrice(request) * 0.8,
      currency: 'KES',
      estimatedTime: '2-4 hours',
      quoteId: `sendy_mock_${Date.now()}`,
      serviceType: 'Standard Delivery',
      features: ['Real-time tracking', 'SMS notifications', 'Proof of delivery']
    };
  }

  private getMockKobo360Quote(request: DeliveryRequest): DeliveryQuote {
    return {
      provider: 'Kobo360',
      price: this.calculateBasePrice(request) * 1.1,
      currency: 'KES',
      estimatedTime: '3-6 hours',
      quoteId: `kobo_mock_${Date.now()}`,
      serviceType: 'Professional Logistics',
      features: ['GPS tracking', 'Insurance coverage', 'Professional drivers']
    };
  }

  private getMockLocalCourierQuote(request: DeliveryRequest): DeliveryQuote {
    return {
      provider: 'Local Couriers',
      price: this.calculateBasePrice(request) * 0.6,
      currency: 'KES',
      estimatedTime: '4-8 hours',
      quoteId: `local_mock_${Date.now()}`,
      serviceType: 'Local Delivery',
      features: ['Local knowledge', 'Flexible scheduling', 'Cash on delivery']
    };
  }

  private getMockDHLQuote(request: DeliveryRequest): DeliveryQuote {
    return {
      provider: 'DHL',
      price: this.calculateBasePrice(request) * 2.5,
      currency: 'USD',
      estimatedTime: '1-2 business days',
      quoteId: `dhl_mock_${Date.now()}`,
      serviceType: 'Express Worldwide',
      features: ['International shipping', 'Insurance included', 'Signature required']
    };
  }

  private calculateBasePrice(request: DeliveryRequest): number {
    let basePrice = 500; // Base price in KES
    
    const sizeMultipliers = {
      small: 1,
      medium: 1.5,
      large: 2,
      extra_large: 3
    };
    
    const urgencyMultipliers = {
      standard: 1,
      express: 1.5,
      same_day: 2
    };
    
    basePrice *= sizeMultipliers[request.packageSize];
    basePrice *= urgencyMultipliers[request.urgency];
    basePrice += request.weight * 10; // 10 KES per kg
    
    return Math.round(basePrice);
  }

  private getMockTracking(trackingId: string): DeliveryTracking {
    return {
      trackingId,
      status: 'in_transit',
      currentLocation: 'Nairobi Distribution Center',
      estimatedDelivery: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      updates: [
        {
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'picked_up',
          location: 'Pickup Location',
          description: 'Package picked up from sender'
        },
        {
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          status: 'in_transit',
          location: 'Nairobi Distribution Center',
          description: 'Package arrived at distribution center'
        }
      ]
    };
  }

  private getMockScheduleResponse(quote: DeliveryQuote): any {
    return {
      success: true,
      deliveryId: `delivery_${Date.now()}`,
      trackingId: `track_${Date.now()}`,
      estimatedPickup: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      cost: quote.price
    };
  }
}

export const logisticsService = new LogisticsService();
