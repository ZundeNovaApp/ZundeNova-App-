export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'seeds' | 'fertilizers' | 'pesticides' | 'tools' | 'feed' | 'medicine' | 'other';
  price: number;
  currency: string;
  images: string[];
  specifications?: Record<string, string>;
  availability: 'in_stock' | 'out_of_stock' | 'limited';
  sellerId: string;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}
