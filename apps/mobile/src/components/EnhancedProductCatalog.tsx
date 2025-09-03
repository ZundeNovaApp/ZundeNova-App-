import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Modal, Image } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  specifications: {
    [key: string]: string | number;
  };
  price: number;
  currency: string;
  stock_quantity: number;
  minimum_order: number;
  unit: string;
  images: string[];
  availability_status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order';
  lead_time_days: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  brand: string;
  manufacturer: string;
  base_price: number;
  currency: string;
  variants: ProductVariant[];
  tenant_availability: {
    [tenant_id: string]: {
      available: boolean;
      price_override?: number;
      stock_override?: number;
      promotional_price?: number;
      promotion_end_date?: string;
    };
  };
  specifications: {
    [key: string]: string | number;
  };
  certifications: string[];
  tags: string[];
  images: string[];
  videos: string[];
  documents: string[];
  rating: {
    average: number;
    count: number;
    distribution: {
      [stars: number]: number;
    };
  };
  reviews: ProductReview[];
  seasonal_availability: {
    available_months: number[];
    peak_season: number[];
    off_season: number[];
  };
  shipping_info: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    shipping_class: string;
    hazardous: boolean;
    temperature_controlled: boolean;
  };
  supplier_info: {
    supplier_id: string;
    supplier_name: string;
    supplier_rating: number;
    lead_time_days: number;
    minimum_order_quantity: number;
  };
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | 'discontinued';
}

interface ProductReview {
  id: string;
  user_id: string;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  verified_purchase: boolean;
  helpful_votes: number;
  images: string[];
  date: string;
  variant_id?: string;
}

interface PromotionalPricing {
  id: string;
  product_id: string;
  variant_id?: string;
  tenant_id?: string;
  promotion_type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bulk_discount';
  discount_value: number;
  minimum_quantity?: number;
  maximum_quantity?: number;
  start_date: string;
  end_date: string;
  conditions: {
    [key: string]: any;
  };
  usage_limit?: number;
  usage_count: number;
  active: boolean;
}

export const EnhancedProductCatalog: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'promotions' | 'analytics'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<PromotionalPricing[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating' | 'popularity'>('name');
  const [currentTenant] = useState('tenant_001'); // Current tenant context

  useEffect(() => {
    loadCatalogData();
  }, []);

  const loadCatalogData = async () => {
    try {
      const productsData = await offlineStorageService.getOfflineDataByType('enhanced_products');
      const promotionsData = await offlineStorageService.getOfflineDataByType('promotional_pricing');
      
      if (productsData.length > 0) {
        setProducts(productsData[0].data);
      } else {
        setProducts(getSampleProducts());
      }
      
      if (promotionsData.length > 0) {
        setPromotions(promotionsData[0].data);
      } else {
        setPromotions(getSamplePromotions());
      }
    } catch (error) {
      console.error('Failed to load catalog data:', error);
    }
  };

  const getSampleProducts = (): Product[] => [
    {
      id: 'prod_001',
      name: 'Premium NPK Fertilizer',
      category: 'Fertilizers',
      subcategory: 'Compound Fertilizers',
      description: 'High-quality NPK fertilizer with balanced nutrients for optimal crop growth',
      brand: 'AgriNutrients',
      manufacturer: 'AgriNutrients Ltd',
      base_price: 45.00,
      currency: 'USD',
      variants: [
        {
          id: 'var_001',
          name: '15-15-15 NPK',
          sku: 'NPK-151515-50KG',
          specifications: {
            nitrogen: 15,
            phosphorus: 15,
            potassium: 15,
            weight: 50
          },
          price: 45.00,
          currency: 'USD',
          stock_quantity: 500,
          minimum_order: 10,
          unit: 'bags',
          images: ['npk_15_15_15.jpg'],
          availability_status: 'in_stock',
          lead_time_days: 3
        },
        {
          id: 'var_002',
          name: '20-10-10 NPK',
          sku: 'NPK-201010-50KG',
          specifications: {
            nitrogen: 20,
            phosphorus: 10,
            potassium: 10,
            weight: 50
          },
          price: 48.00,
          currency: 'USD',
          stock_quantity: 300,
          minimum_order: 10,
          unit: 'bags',
          images: ['npk_20_10_10.jpg'],
          availability_status: 'in_stock',
          lead_time_days: 3
        }
      ],
      tenant_availability: {
        'tenant_001': {
          available: true,
          promotional_price: 40.50,
          promotion_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        'tenant_002': {
          available: true,
          price_override: 47.00
        }
      },
      specifications: {
        application_rate: '200-400 kg/ha',
        storage_temp: '5-35°C',
        shelf_life: '24 months',
        organic: 'false'
      },
      certifications: ['ISO 9001', 'IFDC Certified'],
      tags: ['fertilizer', 'npk', 'compound', 'balanced'],
      images: ['npk_main.jpg', 'npk_application.jpg'],
      videos: ['npk_application_guide.mp4'],
      documents: ['npk_technical_sheet.pdf', 'application_guide.pdf'],
      rating: {
        average: 4.6,
        count: 127,
        distribution: {
          5: 78,
          4: 32,
          3: 12,
          2: 3,
          1: 2
        }
      },
      reviews: [
        {
          id: 'rev_001',
          user_id: 'user_001',
          user_name: 'John Farmer',
          rating: 5,
          title: 'Excellent results on maize',
          comment: 'Used this on my maize crop and saw 20% increase in yield. Highly recommend!',
          verified_purchase: true,
          helpful_votes: 15,
          images: ['review_maize_field.jpg'],
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          variant_id: 'var_001'
        }
      ],
      seasonal_availability: {
        available_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        peak_season: [3, 4, 5, 10, 11],
        off_season: []
      },
      shipping_info: {
        weight: 50,
        dimensions: {
          length: 80,
          width: 50,
          height: 15
        },
        shipping_class: 'standard',
        hazardous: false,
        temperature_controlled: false
      },
      supplier_info: {
        supplier_id: 'sup_001',
        supplier_name: 'AgriNutrients Ltd',
        supplier_rating: 4.8,
        lead_time_days: 3,
        minimum_order_quantity: 100
      },
      created_at: '2023-01-15T00:00:00Z',
      updated_at: new Date().toISOString(),
      status: 'active'
    },
    {
      id: 'prod_002',
      name: 'Organic Pest Control Spray',
      category: 'Pesticides',
      subcategory: 'Organic Pesticides',
      description: 'Natural pest control solution made from neem oil and botanical extracts',
      brand: 'EcoGuard',
      manufacturer: 'EcoGuard Solutions',
      base_price: 25.00,
      currency: 'USD',
      variants: [
        {
          id: 'var_003',
          name: '1L Concentrate',
          sku: 'ECO-PEST-1L',
          specifications: {
            concentration: '5%',
            volume: 1,
            coverage: '1 hectare'
          },
          price: 25.00,
          currency: 'USD',
          stock_quantity: 200,
          minimum_order: 5,
          unit: 'bottles',
          images: ['eco_pest_1l.jpg'],
          availability_status: 'in_stock',
          lead_time_days: 2
        },
        {
          id: 'var_004',
          name: '5L Concentrate',
          sku: 'ECO-PEST-5L',
          specifications: {
            concentration: '5%',
            volume: 5,
            coverage: '5 hectares'
          },
          price: 110.00,
          currency: 'USD',
          stock_quantity: 80,
          minimum_order: 2,
          unit: 'bottles',
          images: ['eco_pest_5l.jpg'],
          availability_status: 'low_stock',
          lead_time_days: 5
        }
      ],
      tenant_availability: {
        'tenant_001': {
          available: true
        },
        'tenant_002': {
          available: true,
          price_override: 23.00
        }
      },
      specifications: {
        active_ingredient: 'Neem Oil',
        organic_certified: 'true',
        application_rate: '2-4 ml/L water',
        preharvest_interval: '1 day'
      },
      certifications: ['OMRI Listed', 'Organic Certified', 'EPA Registered'],
      tags: ['organic', 'pesticide', 'neem', 'natural', 'eco-friendly'],
      images: ['eco_pest_main.jpg', 'eco_pest_application.jpg'],
      videos: ['organic_pest_control_guide.mp4'],
      documents: ['eco_pest_label.pdf', 'organic_certification.pdf'],
      rating: {
        average: 4.3,
        count: 89,
        distribution: {
          5: 45,
          4: 28,
          3: 12,
          2: 3,
          1: 1
        }
      },
      reviews: [
        {
          id: 'rev_002',
          user_id: 'user_002',
          user_name: 'Mary Organic',
          rating: 5,
          title: 'Perfect for organic farming',
          comment: 'Great organic solution. Effective against aphids and whiteflies without harming beneficial insects.',
          verified_purchase: true,
          helpful_votes: 22,
          images: [],
          date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          variant_id: 'var_003'
        }
      ],
      seasonal_availability: {
        available_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        peak_season: [4, 5, 6, 7, 8, 9],
        off_season: []
      },
      shipping_info: {
        weight: 1.2,
        dimensions: {
          length: 25,
          width: 8,
          height: 8
        },
        shipping_class: 'hazmat',
        hazardous: true,
        temperature_controlled: false
      },
      supplier_info: {
        supplier_id: 'sup_002',
        supplier_name: 'EcoGuard Solutions',
        supplier_rating: 4.5,
        lead_time_days: 2,
        minimum_order_quantity: 50
      },
      created_at: '2023-03-20T00:00:00Z',
      updated_at: new Date().toISOString(),
      status: 'active'
    },
    {
      id: 'prod_003',
      name: 'Hybrid Maize Seeds',
      category: 'Seeds',
      subcategory: 'Cereal Seeds',
      description: 'High-yielding hybrid maize seeds with drought tolerance and disease resistance',
      brand: 'SeedTech',
      manufacturer: 'SeedTech International',
      base_price: 120.00,
      currency: 'USD',
      variants: [
        {
          id: 'var_005',
          name: 'ST-2024 Variety',
          sku: 'MAIZE-ST2024-10KG',
          specifications: {
            variety: 'ST-2024',
            maturity_days: 120,
            yield_potential: '8-12 tons/ha',
            weight: 10
          },
          price: 120.00,
          currency: 'USD',
          stock_quantity: 150,
          minimum_order: 1,
          unit: 'bags',
          images: ['maize_st2024.jpg'],
          availability_status: 'in_stock',
          lead_time_days: 7
        }
      ],
      tenant_availability: {
        'tenant_001': {
          available: true
        },
        'tenant_002': {
          available: false
        }
      },
      specifications: {
        germination_rate: '95%',
        plant_height: '2.5-3.0m',
        drought_tolerance: 'High',
        disease_resistance: 'MLN, GLS, Rust'
      },
      certifications: ['ISTA Certified', 'Variety Release Certificate'],
      tags: ['seeds', 'maize', 'hybrid', 'drought-tolerant', 'high-yield'],
      images: ['maize_seeds_main.jpg', 'maize_field.jpg', 'maize_cobs.jpg'],
      videos: ['maize_planting_guide.mp4'],
      documents: ['variety_description.pdf', 'planting_guide.pdf'],
      rating: {
        average: 4.8,
        count: 203,
        distribution: {
          5: 156,
          4: 32,
          3: 10,
          2: 3,
          1: 2
        }
      },
      reviews: [],
      seasonal_availability: {
        available_months: [2, 3, 4, 5, 10, 11, 12],
        peak_season: [3, 4, 11, 12],
        off_season: [6, 7, 8, 9]
      },
      shipping_info: {
        weight: 10,
        dimensions: {
          length: 60,
          width: 40,
          height: 20
        },
        shipping_class: 'standard',
        hazardous: false,
        temperature_controlled: true
      },
      supplier_info: {
        supplier_id: 'sup_003',
        supplier_name: 'SeedTech International',
        supplier_rating: 4.9,
        lead_time_days: 7,
        minimum_order_quantity: 20
      },
      created_at: '2023-02-01T00:00:00Z',
      updated_at: new Date().toISOString(),
      status: 'active'
    }
  ];

  const getSamplePromotions = (): PromotionalPricing[] => [
    {
      id: 'promo_001',
      product_id: 'prod_001',
      tenant_id: 'tenant_001',
      promotion_type: 'percentage',
      discount_value: 10,
      minimum_quantity: 20,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      conditions: {
        first_time_buyer: false,
        bulk_purchase: true
      },
      usage_limit: 100,
      usage_count: 23,
      active: true
    },
    {
      id: 'promo_002',
      product_id: 'prod_002',
      promotion_type: 'buy_x_get_y',
      discount_value: 1, // Buy 5 get 1 free
      minimum_quantity: 5,
      start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
      conditions: {
        variant_specific: true,
        variant_id: 'var_003'
      },
      usage_count: 12,
      active: true
    }
  ];

  const saveCatalogData = async () => {
    try {
      await offlineStorageService.storeOfflineData({
        id: 'enhanced_products',
        type: 'marketplace' as any,
        data: products
      });
      
      await offlineStorageService.storeOfflineData({
        id: 'promotional_pricing',
        type: 'marketplace' as any,
        data: promotions
      });
    } catch (error) {
      console.error('Failed to save catalog data:', error);
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'in_stock': return '#22C55E';
      case 'low_stock': return '#F59E0B';
      case 'out_of_stock': return '#EF4444';
      case 'pre_order': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getAvailabilityIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return '✅';
      case 'low_stock': return '⚠️';
      case 'out_of_stock': return '❌';
      case 'pre_order': return '📅';
      default: return '❓';
    }
  };

  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '⭐'.repeat(fullStars) + (hasHalfStar ? '⭐' : '') + '☆'.repeat(emptyStars);
  };

  const calculatePromotionalPrice = (product: Product, variant: ProductVariant) => {
    const tenantAvailability = product.tenant_availability[currentTenant];
    if (tenantAvailability?.promotional_price && tenantAvailability.promotion_end_date) {
      const endDate = new Date(tenantAvailability.promotion_end_date);
      if (endDate > new Date()) {
        return tenantAvailability.promotional_price;
      }
    }
    
    const activePromotion = promotions.find(p => 
      p.product_id === product.id && 
      p.active && 
      new Date(p.start_date) <= new Date() && 
      new Date(p.end_date) >= new Date() &&
      (!p.variant_id || p.variant_id === variant.id)
    );
    
    if (activePromotion) {
      if (activePromotion.promotion_type === 'percentage') {
        return variant.price * (1 - activePromotion.discount_value / 100);
      } else if (activePromotion.promotion_type === 'fixed_amount') {
        return Math.max(0, variant.price - activePromotion.discount_value);
      }
    }
    
    return tenantAvailability?.price_override || variant.price;
  };

  const filteredProducts = products.filter(product => {
    const tenantAvailable = product.tenant_availability[currentTenant]?.available !== false;
    if (!tenantAvailable) return false;
    
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    
    const matchesAvailability = filterAvailability === 'all' || 
                               product.variants.some(v => v.availability_status === filterAvailability);
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        const aPrice = Math.min(...a.variants.map(v => calculatePromotionalPrice(a, v)));
        const bPrice = Math.min(...b.variants.map(v => calculatePromotionalPrice(b, v)));
        return aPrice - bPrice;
      case 'rating':
        return b.rating.average - a.rating.average;
      case 'popularity':
        return b.rating.count - a.rating.count;
      default:
        return 0;
    }
  });

  const categories = [...new Set(products.map(p => p.category))];

  const renderProducts = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search products..."
          placeholderTextColor="#9CA3AF"
        />
        
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
            <TouchableOpacity
              style={[styles.filter, filterCategory === 'all' && styles.filterActive]}
              onPress={() => setFilterCategory('all')}
            >
              <Text style={[styles.filterText, filterCategory === 'all' && styles.filterTextActive]}>
                All Categories
              </Text>
            </TouchableOpacity>
            
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[styles.filter, filterCategory === category && styles.filterActive]}
                onPress={() => setFilterCategory(category)}
              >
                <Text style={[styles.filterText, filterCategory === category && styles.filterTextActive]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
            <TouchableOpacity
              style={[styles.filter, sortBy === 'name' && styles.filterActive]}
              onPress={() => setSortBy('name')}
            >
              <Text style={[styles.filterText, sortBy === 'name' && styles.filterTextActive]}>
                Name
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filter, sortBy === 'price' && styles.filterActive]}
              onPress={() => setSortBy('price')}
            >
              <Text style={[styles.filterText, sortBy === 'price' && styles.filterTextActive]}>
                Price
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filter, sortBy === 'rating' && styles.filterActive]}
              onPress={() => setSortBy('rating')}
            >
              <Text style={[styles.filterText, sortBy === 'rating' && styles.filterTextActive]}>
                Rating
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filter, sortBy === 'popularity' && styles.filterActive]}
              onPress={() => setSortBy('popularity')}
            >
              <Text style={[styles.filterText, sortBy === 'popularity' && styles.filterTextActive]}>
                Popular
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {sortedProducts.map(product => (
        <View key={product.id} style={styles.productCard}>
          <View style={styles.productHeader}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productBrand}>{product.brand}</Text>
              <Text style={styles.productCategory}>{product.category} • {product.subcategory}</Text>
            </View>
            
            <View style={styles.productRating}>
              <Text style={styles.ratingStars}>{getRatingStars(product.rating.average)}</Text>
              <Text style={styles.ratingText}>
                {product.rating.average.toFixed(1)} ({product.rating.count})
              </Text>
            </View>
          </View>

          <Text style={styles.productDescription}>{product.description}</Text>

          <View style={styles.certificationsContainer}>
            {product.certifications.slice(0, 3).map(cert => (
              <View key={cert} style={styles.certificationBadge}>
                <Text style={styles.certificationText}>{cert}</Text>
              </View>
            ))}
          </View>

          <View style={styles.variantsContainer}>
            <Text style={styles.variantsTitle}>Available Variants</Text>
            {product.variants.map(variant => {
              const promotionalPrice = calculatePromotionalPrice(product, variant);
              const hasPromotion = promotionalPrice < variant.price;
              
              return (
                <View key={variant.id} style={styles.variantCard}>
                  <View style={styles.variantHeader}>
                    <Text style={styles.variantName}>{variant.name}</Text>
                    <View style={[styles.availabilityBadge, { backgroundColor: getAvailabilityColor(variant.availability_status) }]}>
                      <Text style={styles.availabilityText}>
                        {getAvailabilityIcon(variant.availability_status)} {variant.availability_status.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.variantDetails}>
                    <View style={styles.priceContainer}>
                      {hasPromotion && (
                        <Text style={styles.originalPrice}>
                          ${variant.price.toFixed(2)}
                        </Text>
                      )}
                      <Text style={[styles.currentPrice, hasPromotion && styles.promotionalPrice]}>
                        ${promotionalPrice.toFixed(2)}
                      </Text>
                      {hasPromotion && (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>
                            -{Math.round((1 - promotionalPrice / variant.price) * 100)}%
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <Text style={styles.variantStock}>
                      Stock: {variant.stock_quantity} {variant.unit}
                    </Text>
                    <Text style={styles.variantMinOrder}>
                      Min Order: {variant.minimum_order} {variant.unit}
                    </Text>
                  </View>
                  
                  <View style={styles.specificationsContainer}>
                    {Object.entries(variant.specifications).slice(0, 3).map(([key, value]) => (
                      <Text key={key} style={styles.specification}>
                        {key}: {value}
                      </Text>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.productActions}>
            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => {
                setSelectedProduct(product);
                setShowProductModal(true);
              }}
            >
              <Text style={styles.viewDetailsButtonText}>View Details</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.addToCartButton}>
              <Text style={styles.addToCartButtonText}>Add to Cart</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.compareButton}>
              <Text style={styles.compareButtonText}>Compare</Text>
            </TouchableOpacity>
          </View>

          {product.reviews.length > 0 && (
            <View style={styles.reviewsPreview}>
              <Text style={styles.reviewsTitle}>Recent Review</Text>
              {product.reviews.slice(0, 1).map(review => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{review.user_name}</Text>
                    <Text style={styles.reviewRating}>{getRatingStars(review.rating)}</Text>
                  </View>
                  <Text style={styles.reviewTitle}>{review.title}</Text>
                  <Text style={styles.reviewComment} numberOfLines={2}>
                    {review.comment}
                  </Text>
                  {review.verified_purchase && (
                    <Text style={styles.verifiedPurchase}>✅ Verified Purchase</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderPromotions = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Active Promotions</Text>
      
      {promotions.filter(p => p.active).map(promotion => {
        const product = products.find(p => p.id === promotion.product_id);
        if (!product) return null;
        
        return (
          <View key={promotion.id} style={styles.promotionCard}>
            <View style={styles.promotionHeader}>
              <Text style={styles.promotionProduct}>{product.name}</Text>
              <View style={styles.promotionType}>
                <Text style={styles.promotionTypeText}>
                  {promotion.promotion_type.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>
            
            <View style={styles.promotionDetails}>
              <Text style={styles.promotionDiscount}>
                {promotion.promotion_type === 'percentage' && `${promotion.discount_value}% OFF`}
                {promotion.promotion_type === 'fixed_amount' && `$${promotion.discount_value} OFF`}
                {promotion.promotion_type === 'buy_x_get_y' && `Buy ${promotion.minimum_quantity} Get ${promotion.discount_value} FREE`}
              </Text>
              
              {promotion.minimum_quantity && (
                <Text style={styles.promotionCondition}>
                  Minimum quantity: {promotion.minimum_quantity}
                </Text>
              )}
              
              <Text style={styles.promotionPeriod}>
                Valid until: {new Date(promotion.end_date).toLocaleDateString()}
              </Text>
              
              {promotion.usage_limit && (
                <Text style={styles.promotionUsage}>
                  Used: {promotion.usage_count}/{promotion.usage_limit}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );

  const renderProductModal = () => (
    <Modal
      visible={showProductModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowProductModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Product Details</Text>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowProductModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {selectedProduct && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.productDetailHeader}>
              <Text style={styles.productDetailName}>{selectedProduct.name}</Text>
              <Text style={styles.productDetailBrand}>{selectedProduct.brand}</Text>
              <Text style={styles.productDetailRating}>
                {getRatingStars(selectedProduct.rating.average)} {selectedProduct.rating.average.toFixed(1)} ({selectedProduct.rating.count} reviews)
              </Text>
            </View>

            <View style={styles.productDetailDescription}>
              <Text style={styles.productDetailDescriptionText}>
                {selectedProduct.description}
              </Text>
            </View>

            <View style={styles.specificationsSection}>
              <Text style={styles.specificationsSectionTitle}>Specifications</Text>
              {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                <View key={key} style={styles.specificationRow}>
                  <Text style={styles.specificationKey}>{key}:</Text>
                  <Text style={styles.specificationValue}>{value}</Text>
                </View>
              ))}
            </View>

            <View style={styles.certificationsSection}>
              <Text style={styles.certificationsSectionTitle}>Certifications</Text>
              <View style={styles.certificationsGrid}>
                {selectedProduct.certifications.map(cert => (
                  <View key={cert} style={styles.certificationDetailBadge}>
                    <Text style={styles.certificationDetailText}>{cert}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.supplierSection}>
              <Text style={styles.supplierSectionTitle}>Supplier Information</Text>
              <Text style={styles.supplierName}>{selectedProduct.supplier_info.supplier_name}</Text>
              <Text style={styles.supplierRating}>
                Rating: {getRatingStars(selectedProduct.supplier_info.supplier_rating)} {selectedProduct.supplier_info.supplier_rating.toFixed(1)}
              </Text>
              <Text style={styles.supplierLeadTime}>
                Lead Time: {selectedProduct.supplier_info.lead_time_days} days
              </Text>
              <Text style={styles.supplierMinOrder}>
                Minimum Order: {selectedProduct.supplier_info.minimum_order_quantity} units
              </Text>
            </View>

            <View style={styles.reviewsSection}>
              <Text style={styles.reviewsSectionTitle}>Customer Reviews</Text>
              {selectedProduct.reviews.map(review => (
                <View key={review.id} style={styles.reviewDetailItem}>
                  <View style={styles.reviewDetailHeader}>
                    <Text style={styles.reviewDetailName}>{review.user_name}</Text>
                    <Text style={styles.reviewDetailRating}>{getRatingStars(review.rating)}</Text>
                  </View>
                  <Text style={styles.reviewDetailTitle}>{review.title}</Text>
                  <Text style={styles.reviewDetailComment}>{review.comment}</Text>
                  <Text style={styles.reviewDetailDate}>
                    {new Date(review.date).toLocaleDateString()}
                  </Text>
                  {review.verified_purchase && (
                    <Text style={styles.reviewDetailVerified}>✅ Verified Purchase</Text>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Enhanced Product Catalog</Text>
        <Text style={styles.subtitle}>Advanced product management & discovery</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.activeTab]}
          onPress={() => setActiveTab('products')}
        >
          <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
            Products ({sortedProducts.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'promotions' && styles.activeTab]}
          onPress={() => setActiveTab('promotions')}
        >
          <Text style={[styles.tabText, activeTab === 'promotions' && styles.activeTabText]}>
            Promotions
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'products' && renderProducts()}
      {activeTab === 'promotions' && renderPromotions()}

      {renderProductModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#228B22',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E5E7EB',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#228B22',
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#228B22',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  filterRow: {
    marginBottom: 8,
  },
  filters: {
    flexDirection: 'row',
  },
  filter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterActive: {
    backgroundColor: '#228B22',
    borderColor: '#228B22',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  productRating: {
    alignItems: 'flex-end',
  },
  ratingStars: {
    fontSize: 16,
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
  },
  productDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  certificationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  certificationBadge: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  certificationText: {
    fontSize: 10,
    color: '#1E40AF',
    fontWeight: '600',
  },
  variantsContainer: {
    marginBottom: 16,
  },
  variantsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  variantCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  variantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  variantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  availabilityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  availabilityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  variantDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  promotionalPrice: {
    color: '#DC2626',
  },
  discountBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  discountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  variantStock: {
    fontSize: 12,
    color: '#6B7280',
  },
  variantMinOrder: {
    fontSize: 12,
    color: '#6B7280',
  },
  specificationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specification: {
    fontSize: 11,
    color: '#6B7280',
    marginRight: 12,
    marginBottom: 2,
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  viewDetailsButton: {
    backgroundColor: '#228B22',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 4,
  },
  viewDetailsButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  compareButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginLeft: 4,
  },
  compareButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  reviewsPreview: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  reviewsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  reviewItem: {
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  reviewRating: {
    fontSize: 12,
  },
  reviewTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 4,
  },
  verifiedPurchase: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  promotionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  promotionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  promotionProduct: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  promotionType: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  promotionTypeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  promotionDetails: {
    marginTop: 8,
  },
  promotionDiscount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8,
  },
  promotionCondition: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  promotionPeriod: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  promotionUsage: {
    fontSize: 12,
    color: '#6B7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#228B22',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  productDetailHeader: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productDetailName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  productDetailBrand: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  productDetailRating: {
    fontSize: 14,
    color: '#374151',
  },
  productDetailDescription: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productDetailDescriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  specificationsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  specificationsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  specificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  specificationKey: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  specificationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'right',
  },
  certificationsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  certificationsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  certificationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  certificationDetailBadge: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  certificationDetailText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '600',
  },
  supplierSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supplierSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  supplierRating: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  supplierLeadTime: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  supplierMinOrder: {
    fontSize: 14,
    color: '#6B7280',
  },
  reviewsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  reviewDetailItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  reviewDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewDetailName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  reviewDetailRating: {
    fontSize: 14,
  },
  reviewDetailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  reviewDetailComment: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDetailDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  reviewDetailVerified: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
});

export default EnhancedProductCatalog;
