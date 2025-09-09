'use client';

import React, { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  imageUrl: string;
  seller: {
    name: string;
    rating: number;
    location: string;
  };
  stock: number;
  unit: string;
  tags: string[];
  isOrganic: boolean;
  deliveryOptions: string[];
  rating: number;
  reviewCount: number;
}

interface MarketplaceFilters {
  category: string;
  priceRange: [number, number];
  location: string;
  isOrganic: boolean;
  deliveryOption: string;
  sortBy: string;
}

export default function EnhancedMarketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [showCart, setShowCart] = useState(false);

  const [filters, setFilters] = useState<MarketplaceFilters>({
    category: '',
    priceRange: [0, 1000],
    location: '',
    isOrganic: false,
    deliveryOption: '',
    sortBy: 'name'
  });

  const categories = [
    'Seeds & Seedlings',
    'Fertilizers',
    'Pesticides',
    'Farm Tools',
    'Livestock Feed',
    'Veterinary Supplies',
    'Irrigation Equipment',
    'Fresh Produce'
  ];

  const deliveryOptions = [
    'Same Day Delivery',
    'Next Day Delivery',
    'Standard Delivery',
    'Pickup Available'
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, filters, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/marketplace/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    if (filters.isOrganic) {
      filtered = filtered.filter(product => product.isOrganic);
    }

    if (filters.location) {
      filtered = filtered.filter(product =>
        product.seller.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.deliveryOption) {
      filtered = filtered.filter(product =>
        product.deliveryOptions.includes(filters.deliveryOption)
      );
    }

    filtered = filtered.filter(product =>
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredProducts(filtered);
  };

  const addToCart = (productId: string, quantity: number = 1) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + quantity
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[productId];
      return newCart;
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prev => ({
        ...prev,
        [productId]: quantity
      }));
    }
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + (product ? product.price * quantity : 0);
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const handleCheckout = async () => {
    try {
      const orderItems = Object.entries(cart).map(([productId, quantity]) => ({
        productId,
        quantity,
        price: products.find(p => p.id === productId)?.price || 0
      }));

      const response = await fetch('/api/marketplace/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items: orderItems,
          totalAmount: getCartTotal()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      setCart({});
      setShowCart(false);
      alert('Order placed successfully!');
    } catch (err) {
      alert('Failed to place order. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-80 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Agricultural Marketplace</h1>
        <button
          onClick={() => setShowCart(!showCart)}
          className="relative bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200"
        >
          🛒 Cart ({getCartItemCount()})
          {getCartItemCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {getCartItemCount()}
            </span>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Search products..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="name">Name</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.isOrganic}
              onChange={(e) => setFilters(prev => ({ ...prev, isOrganic: e.target.checked }))}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Organic Only</span>
          </label>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Price Range:</span>
            <input
              type="range"
              min="0"
              max="1000"
              value={filters.priceRange[1]}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                priceRange: [prev.priceRange[0], parseInt(e.target.value)] 
              }))}
              className="w-32"
            />
            <span className="text-sm text-gray-600">${filters.priceRange[0]} - ${filters.priceRange[1]}</span>
          </div>
        </div>
      </div>

      {showCart && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Shopping Cart</h3>
          {Object.keys(cart).length === 0 ? (
            <p className="text-gray-600">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(cart).map(([productId, quantity]) => {
                const product = products.find(p => p.id === productId);
                if (!product) return null;

                return (
                  <div key={productId} className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-600">${product.price} per {product.unit}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateCartQuantity(productId, quantity - 1)}
                        className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 bg-gray-100 rounded">{quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(productId, quantity + 1)}
                        className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(productId)}
                        className="text-red-600 hover:text-red-700 ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center justify-between pt-4">
                <div className="text-lg font-semibold text-gray-900">
                  Total: ${getCartTotal().toFixed(2)}
                </div>
                <button
                  onClick={handleCheckout}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors duration-200"
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                {product.isOrganic && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Organic
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
              
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-sm ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">({product.reviewCount})</span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-bold text-green-600">
                  ${product.price} <span className="text-sm text-gray-500">per {product.unit}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Stock: {product.stock}
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                <div>Seller: {product.seller.name}</div>
                <div>📍 {product.seller.location}</div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {product.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => addToCart(product.id)}
                  disabled={product.stock === 0}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors duration-200">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">🛒</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or browse different categories.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilters({
                category: '',
                priceRange: [0, 1000],
                location: '',
                isOrganic: false,
                deliveryOption: '',
                sortBy: 'name'
              });
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
