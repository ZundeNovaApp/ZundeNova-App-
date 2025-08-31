'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@zundenova/ui';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  imageUrl: string;
  inStock: boolean;
  rating: number;
  reviews: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'seeds', name: 'Seeds & Seedlings' },
    { id: 'fertilizers', name: 'Fertilizers' },
    { id: 'pesticides', name: 'Pesticides' },
    { id: 'tools', name: 'Farm Tools' },
    { id: 'livestock', name: 'Livestock Supplies' },
    { id: 'veterinary', name: 'Veterinary Products' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Hybrid Maize Seeds',
          description: 'High-yield drought-resistant maize seeds suitable for various soil types.',
          price: 45.00,
          currency: 'USD',
          category: 'seeds',
          imageUrl: '/api/placeholder/300/200',
          inStock: true,
          rating: 4.5,
          reviews: 128
        },
        {
          id: '2',
          name: 'NPK Fertilizer 15-15-15',
          description: 'Balanced NPK fertilizer for optimal crop growth and development.',
          price: 32.50,
          currency: 'USD',
          category: 'fertilizers',
          imageUrl: '/api/placeholder/300/200',
          inStock: true,
          rating: 4.3,
          reviews: 89
        },
        {
          id: '3',
          name: 'Organic Pesticide Spray',
          description: 'Eco-friendly pesticide effective against common crop pests.',
          price: 28.75,
          currency: 'USD',
          category: 'pesticides',
          imageUrl: '/api/placeholder/300/200',
          inStock: true,
          rating: 4.7,
          reviews: 156
        },
        {
          id: '4',
          name: 'Professional Pruning Shears',
          description: 'Heavy-duty pruning shears for fruit trees and shrubs.',
          price: 65.00,
          currency: 'USD',
          category: 'tools',
          imageUrl: '/api/placeholder/300/200',
          inStock: true,
          rating: 4.8,
          reviews: 203
        },
        {
          id: '5',
          name: 'Livestock Feed Supplement',
          description: 'Nutritional supplement for cattle and goats to improve health.',
          price: 55.25,
          currency: 'USD',
          category: 'livestock',
          imageUrl: '/api/placeholder/300/200',
          inStock: false,
          rating: 4.4,
          reviews: 67
        },
        {
          id: '6',
          name: 'Veterinary Antibiotic Kit',
          description: 'Essential antibiotics for treating common livestock infections.',
          price: 89.99,
          currency: 'USD',
          category: 'veterinary',
          imageUrl: '/api/placeholder/300/200',
          inStock: true,
          rating: 4.9,
          reviews: 94
        }
      ];

      setProducts(mockProducts);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">ZundeNova Marketplace</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <a href="/dashboard" className="text-gray-600 hover:text-green-600">Dashboard</a>
              <a href="/marketplace" className="text-green-600 font-medium">Marketplace</a>
              <a href="/farms" className="text-gray-600 hover:text-green-600">My Farms</a>
              <a href="/consult" className="text-gray-600 hover:text-green-600">Expert Consult</a>
              <div className="relative">
                <button className="flex items-center text-gray-600 hover:text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Search</h3>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-green-100 text-green-800 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {filteredProducts.length} Products Found
              </h2>
              <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating: High to Low</option>
                <option>Newest First</option>
              </select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9">
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">Product Image</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          {product.rating} ({product.reviews} reviews)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="text-gray-600 ml-1">{product.currency}</span>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={!product.inStock}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${
                          product.inStock
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Shopping Cart Sidebar */}
        {cart.length > 0 && (
          <div className="fixed right-4 top-1/2 transform -translate-y-1/2 w-80 bg-white rounded-lg shadow-lg border p-6 z-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shopping Cart</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.product.name}</p>
                    <p className="text-sm text-gray-600">${item.product.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-600 hover:text-red-700 ml-2"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-bold text-xl text-gray-900">${cartTotal.toFixed(2)}</span>
              </div>
              <button className="w-full bg-green-600 text-white py-2 rounded-md font-medium hover:bg-green-700 transition-colors">
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
