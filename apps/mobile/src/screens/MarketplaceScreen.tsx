import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

export default function MarketplaceScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All', icon: '🛒' },
    { id: 'seeds', name: 'Seeds', icon: '🌱' },
    { id: 'fertilizers', name: 'Fertilizers', icon: '🧪' },
    { id: 'tools', name: 'Tools', icon: '🔧' },
    { id: 'livestock', name: 'Livestock', icon: '🐄' },
  ];

  const products = [
    {
      id: '1',
      name: 'NPK 15-15-15 Fertilizer',
      price: 45.99,
      unit: '50kg bag',
      category: 'fertilizers',
      rating: 4.5,
      inStock: true,
      description: 'High-quality balanced fertilizer for all crops'
    },
    {
      id: '2',
      name: 'Hybrid Maize Seeds',
      price: 12.50,
      unit: '1kg',
      category: 'seeds',
      rating: 4.8,
      inStock: true,
      description: 'High-yield drought-resistant maize variety'
    },
    {
      id: '3',
      name: 'Organic Pesticide',
      price: 28.75,
      unit: '1L',
      category: 'fertilizers',
      rating: 4.3,
      inStock: false,
      description: 'Eco-friendly pest control solution'
    },
    {
      id: '4',
      name: 'Hand Cultivator',
      price: 35.00,
      unit: 'piece',
      category: 'tools',
      rating: 4.6,
      inStock: true,
      description: 'Durable steel hand cultivator for small plots'
    }
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderProductCard = (product: any) => (
    <View key={product.id} style={styles.productCard}>
      <View style={styles.productHeader}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>${product.price}</Text>
      </View>
      
      <Text style={styles.productUnit}>per {product.unit}</Text>
      <Text style={styles.productDescription}>{product.description}</Text>
      
      <View style={styles.productFooter}>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {product.rating}</Text>
          <Text style={[styles.stockStatus, { color: product.inStock ? '#10B981' : '#dc3545' }]}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.addToCartButton, !product.inStock && styles.disabledButton]}
          disabled={!product.inStock}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Marketplace</Text>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.activeCategoryButton
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.activeCategoryText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.productsContainer}>
        <View style={styles.productsHeader}>
          <Text style={styles.productsTitle}>
            {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.name}
          </Text>
          <Text style={styles.productsCount}>
            {filteredProducts.length} items
          </Text>
        </View>

        {filteredProducts.map(renderProductCard)}
      </ScrollView>

      <TouchableOpacity style={styles.cartButton}>
        <Text style={styles.cartButtonText}>🛒 View Cart (3)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#228B22',
    padding: 20,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryButton: {
    alignItems: 'center',
    marginRight: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    minWidth: 70,
  },
  activeCategoryButton: {
    backgroundColor: '#10B981',
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  activeCategoryText: {
    color: 'white',
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  productsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  productsCount: {
    fontSize: 14,
    color: '#666',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  productUnit: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flex: 1,
  },
  rating: {
    fontSize: 14,
    color: '#F59E0B',
    marginBottom: 2,
  },
  stockStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  addToCartButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  addToCartText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  cartButton: {
    backgroundColor: '#10B981',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
