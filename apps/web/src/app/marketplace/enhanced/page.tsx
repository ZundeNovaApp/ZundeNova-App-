'use client';

import React, { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  description: string;
  imageUrl: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  seller: {
    name: string;
    location: string;
    verified: boolean;
  };
}

export default function EnhancedMarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const categories = [
    { id: 'all', name: 'All Products', icon: '🛒' },
    { id: 'seeds', name: 'Seeds & Seedlings', icon: '🌱' },
    { id: 'fertilizers', name: 'Fertilizers', icon: '🧪' },
    { id: 'pesticides', name: 'Pesticides', icon: '🛡️' },
    { id: 'tools', name: 'Farm Tools', icon: '🔧' },
    { id: 'livestock', name: 'Livestock Feed', icon: '🐄' },
    { id: 'equipment', name: 'Equipment', icon: '🚜' },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortBy]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Hybrid Maize Seeds',
          category: 'seeds',
          price: 25.99,
          currency: 'USD',
          description: 'High-yield drought-resistant maize seeds suitable for African climate',
          imageUrl: '/api/placeholder/300/200',
          inStock: true,
          rating: 4.8,
          reviews: 156,
          seller: {
            name: 'AgriSeeds Kenya',
            location: 'Nairobi, Kenya',
            verified: true
          }
        },
        {
          id: '2',
          name: 'NPK Fertilizer 15-15-15',
          category: 'fertilizers',
          price: 45.00,
          currency: 'USD',
          description: 'Balanced NPK fertilizer for optimal crop growth and yield',
          imageUrl: '/api/placeholder/300/200',
          inStock: true,
          rating: 4.6,
          reviews: 89,
          seller: {
            name: 'FertilizerCorp',
            location: 'Kampala, Uganda',
            verified: true
          }
        },
        {
          id: '3',
          name: 'Organic Pesticide Spray',
          category: 'pesticides',
          price: 18.50,
          currency: 'USD',
          description: 'Eco-friendly pesticide for pest control without harmful chemicals',
          imageUrl: '/api/placeholder/300/200',
          inStock: false,
          rating: 4.4,
          reviews: 67,
          seller: {
            name: 'EcoFarm Solutions',
            location: 'Dar es Salaam, Tanzania',
            verified: false
          }
        },
        {
          id: '4',
          name: 'Hand Cultivator Tool',
          category: 'tools',
          price: 12.99,
          currency: 'USD',
          description: 'Durable hand cultivator for small-scale farming operations',
          imageUrl: '/api/placeholder/300/200',
          inStock: true,
          rating: 4.7,
          reviews: 234,
          seller: {
            name: 'ToolMaster Africa',
            location: 'Lagos, Nigeria',
            verified: true
          }
        },
        {
          id: '5',
          name: 'Cattle Feed Pellets',
          category: 'livestock',
          price: 35.00,
          currency: 'USD',
          description: 'Nutritious cattle feed pellets for healthy livestock growth',
          imageUrl: '/api/placeholder/300/200',
          inStock: true,
          rating: 4.5,
          reviews: 112,
          seller: {
            name: 'LivestockNutrition Ltd',
            location: 'Kigali, Rwanda',
            verified: true
          }
        }
      ];
      
      setTimeout(() => {
        setProducts(mockProducts);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load products');
      setIsLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  };

  const addToCart = (productId: string) => {
    console.log('Adding to cart:', productId);
  };

  if (isLoading) {
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🛒 ZundeNova Marketplace</h1>
          <div className="text-sm text-gray-500">
            {filteredProducts.length} products available
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Products
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for products..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedCategory === category.id
                            ? 'text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        style={selectedCategory === category.id ? {backgroundColor: '#00684b'} : {}}
                      >
                        <span className="mr-2">{category.icon}</span>
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="price-low">Price (Low to High)</option>
                    <option value="price-high">Price (High to Low)</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">No products found</h2>
                <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  style={{backgroundColor: '#00684b'}}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="relative">
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">📷 Product Image</span>
                      </div>
                      {!product.inStock && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                          Out of Stock
                        </div>
                      )}
                      {product.seller.verified && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                          ✓ Verified
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                      
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-2">
                          {product.rating} ({product.reviews} reviews)
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl font-bold" style={{color: '#00684b'}}>
                          ${product.price}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.seller.location}
                        </div>
                      </div>

                      <button
                        onClick={() => addToCart(product.id)}
                        disabled={!product.inStock}
                        className="w-full px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                        style={{backgroundColor: product.inStock ? '#007f82' : '#9CA3AF'}}
                      >
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
