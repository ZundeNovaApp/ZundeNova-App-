import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Image } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';

interface MarketplaceProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  quality_grade: 'A' | 'B' | 'C' | 'Premium';
  lot_size: number;
  unit: string;
  seller_id: string;
  seller_name: string;
  location: string;
  lab_certificate?: string;
  images: string[];
  description: string;
  availability: 'available' | 'reserved' | 'sold';
  created_at: string;
}

interface EscrowTransaction {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'funded' | 'released' | 'disputed';
  milestones: {
    id: string;
    description: string;
    amount: number;
    status: 'pending' | 'completed';
    due_date: string;
  }[];
  created_at: string;
}

export const PhaseBMarketplace: React.FC = () => {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [escrowTransactions, setEscrowTransactions] = useState<EscrowTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'escrow' | 'add_product'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [newProduct, setNewProduct] = useState<Partial<MarketplaceProduct>>({
    name: '',
    category: '',
    price: 0,
    currency: 'USD',
    quality_grade: 'A',
    lot_size: 0,
    unit: 'kg',
    description: '',
    location: ''
  });

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const loadMarketplaceData = async () => {
    try {
      const productData = await offlineStorageService.getOfflineDataByType('marketplace_products');
      const escrowData = await offlineStorageService.getOfflineDataByType('escrow_transactions');
      
      if (productData.length > 0) {
        setProducts(productData[0].data);
      } else {
        setProducts(getSampleProducts());
      }
      
      if (escrowData.length > 0) {
        setEscrowTransactions(escrowData[0].data);
      } else {
        setEscrowTransactions(getSampleEscrowTransactions());
      }
    } catch (error) {
      console.error('Failed to load marketplace data:', error);
    }
  };

  const getSampleProducts = (): MarketplaceProduct[] => [
    {
      id: '1',
      name: 'Premium Maize',
      category: 'Grains',
      price: 250,
      currency: 'USD',
      quality_grade: 'Premium',
      lot_size: 1000,
      unit: 'kg',
      seller_id: 'seller1',
      seller_name: 'Green Valley Farm',
      location: 'Nairobi, Kenya',
      lab_certificate: 'cert_001.pdf',
      images: ['maize1.jpg', 'maize2.jpg'],
      description: 'High-quality maize with moisture content below 14%',
      availability: 'available',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Organic Coffee Beans',
      category: 'Cash Crops',
      price: 850,
      currency: 'USD',
      quality_grade: 'A',
      lot_size: 500,
      unit: 'kg',
      seller_id: 'seller2',
      seller_name: 'Highland Coffee Co-op',
      location: 'Meru, Kenya',
      lab_certificate: 'cert_002.pdf',
      images: ['coffee1.jpg'],
      description: 'Certified organic Arabica coffee beans',
      availability: 'available',
      created_at: new Date().toISOString()
    }
  ];

  const getSampleEscrowTransactions = (): EscrowTransaction[] => [
    {
      id: '1',
      product_id: '1',
      buyer_id: 'buyer1',
      seller_id: 'seller1',
      amount: 25000,
      currency: 'USD',
      status: 'funded',
      milestones: [
        {
          id: '1',
          description: 'Product preparation and packaging',
          amount: 12500,
          status: 'completed',
          due_date: '2024-01-15'
        },
        {
          id: '2',
          description: 'Delivery and quality verification',
          amount: 12500,
          status: 'pending',
          due_date: '2024-01-20'
        }
      ],
      created_at: new Date().toISOString()
    }
  ];

  const saveMarketplaceData = async () => {
    try {
      await offlineStorageService.storeOfflineData({
        id: 'marketplace_products',
        type: 'marketplace' as any,
        data: products
      });
      
      await offlineStorageService.storeOfflineData({
        id: 'escrow_transactions',
        type: 'marketplace' as any,
        data: escrowTransactions
      });
    } catch (error) {
      console.error('Failed to save marketplace data:', error);
    }
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.category || !newProduct.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const product: MarketplaceProduct = {
      id: Date.now().toString(),
      name: newProduct.name!,
      category: newProduct.category!,
      price: newProduct.price!,
      currency: newProduct.currency || 'USD',
      quality_grade: newProduct.quality_grade || 'A',
      lot_size: newProduct.lot_size || 0,
      unit: newProduct.unit || 'kg',
      seller_id: 'current_user',
      seller_name: 'Current User',
      location: newProduct.location || '',
      images: [],
      description: newProduct.description || '',
      availability: 'available',
      created_at: new Date().toISOString()
    };

    const updatedProducts = [...products, product];
    setProducts(updatedProducts);
    await saveMarketplaceData();

    setNewProduct({
      name: '',
      category: '',
      price: 0,
      currency: 'USD',
      quality_grade: 'A',
      lot_size: 0,
      unit: 'kg',
      description: '',
      location: ''
    });

    setActiveTab('products');
    Alert.alert('Success', 'Product added successfully!');
  };

  const createEscrowTransaction = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const transaction: EscrowTransaction = {
      id: Date.now().toString(),
      product_id: productId,
      buyer_id: 'current_user',
      seller_id: product.seller_id,
      amount: product.price * product.lot_size,
      currency: product.currency,
      status: 'pending',
      milestones: [
        {
          id: '1',
          description: 'Product preparation',
          amount: (product.price * product.lot_size) * 0.5,
          status: 'pending',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          description: 'Delivery completion',
          amount: (product.price * product.lot_size) * 0.5,
          status: 'pending',
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      created_at: new Date().toISOString()
    };

    const updatedTransactions = [...escrowTransactions, transaction];
    setEscrowTransactions(updatedTransactions);
    await saveMarketplaceData();

    Alert.alert('Success', 'Escrow transaction created successfully!');
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || product.quality_grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'Premium': return '#FFD700';
      case 'A': return '#22C55E';
      case 'B': return '#F59E0B';
      case 'C': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderProducts = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gradeFilter}>
          {['all', 'Premium', 'A', 'B', 'C'].map(grade => (
            <TouchableOpacity
              key={grade}
              style={[
                styles.gradeButton,
                selectedGrade === grade && styles.gradeButtonActive
              ]}
              onPress={() => setSelectedGrade(grade)}
            >
              <Text style={[
                styles.gradeButtonText,
                selectedGrade === grade && styles.gradeButtonTextActive
              ]}>
                {grade === 'all' ? 'All Grades' : `Grade ${grade}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.productList}>
        {filteredProducts.map(product => (
          <View key={product.id} style={styles.productCard}>
            <View style={styles.productHeader}>
              <Text style={styles.productName}>{product.name}</Text>
              <View style={[styles.gradeTag, { backgroundColor: getGradeColor(product.quality_grade) }]}>
                <Text style={styles.gradeTagText}>Grade {product.quality_grade}</Text>
              </View>
            </View>
            
            <Text style={styles.productCategory}>{product.category}</Text>
            <Text style={styles.productDescription}>{product.description}</Text>
            
            <View style={styles.productDetails}>
              <Text style={styles.productPrice}>
                {product.currency} {product.price.toLocaleString()} per {product.unit}
              </Text>
              <Text style={styles.productLot}>Lot Size: {product.lot_size} {product.unit}</Text>
              <Text style={styles.productLocation}>📍 {product.location}</Text>
              <Text style={styles.productSeller}>Seller: {product.seller_name}</Text>
            </View>

            {product.lab_certificate && (
              <View style={styles.certificateContainer}>
                <Text style={styles.certificateText}>📋 Lab Certificate Available</Text>
              </View>
            )}

            <View style={styles.productActions}>
              <TouchableOpacity
                style={styles.escrowButton}
                onPress={() => createEscrowTransaction(product.id)}
              >
                <Text style={styles.escrowButtonText}>Create Escrow Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderEscrow = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Escrow Transactions</Text>
      
      <ScrollView style={styles.escrowList}>
        {escrowTransactions.map(transaction => (
          <View key={transaction.id} style={styles.escrowCard}>
            <View style={styles.escrowHeader}>
              <Text style={styles.escrowId}>Transaction #{transaction.id}</Text>
              <View style={[styles.statusTag, { backgroundColor: getStatusColor(transaction.status) }]}>
                <Text style={styles.statusTagText}>{transaction.status.toUpperCase()}</Text>
              </View>
            </View>
            
            <Text style={styles.escrowAmount}>
              {transaction.currency} {transaction.amount.toLocaleString()}
            </Text>
            
            <View style={styles.milestonesContainer}>
              <Text style={styles.milestonesTitle}>Milestones:</Text>
              {transaction.milestones.map(milestone => (
                <View key={milestone.id} style={styles.milestoneItem}>
                  <Text style={styles.milestoneDescription}>{milestone.description}</Text>
                  <Text style={styles.milestoneAmount}>
                    {transaction.currency} {milestone.amount.toLocaleString()}
                  </Text>
                  <Text style={[
                    styles.milestoneStatus,
                    { color: milestone.status === 'completed' ? '#22C55E' : '#F59E0B' }
                  ]}>
                    {milestone.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderAddProduct = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Add New Product</Text>
      
      <ScrollView style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            value={newProduct.name}
            onChangeText={(text) => setNewProduct({...newProduct, name: text})}
            placeholder="Enter product name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Category *</Text>
          <TextInput
            style={styles.input}
            value={newProduct.category}
            onChangeText={(text) => setNewProduct({...newProduct, category: text})}
            placeholder="e.g., Grains, Cash Crops, Vegetables"
          />
        </View>

        <View style={styles.formRow}>
          <View style={styles.formGroupHalf}>
            <Text style={styles.label}>Price per Unit *</Text>
            <TextInput
              style={styles.input}
              value={newProduct.price?.toString()}
              onChangeText={(text) => setNewProduct({...newProduct, price: parseFloat(text) || 0})}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.formGroupHalf}>
            <Text style={styles.label}>Currency</Text>
            <TextInput
              style={styles.input}
              value={newProduct.currency}
              onChangeText={(text) => setNewProduct({...newProduct, currency: text})}
              placeholder="USD"
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={styles.formGroupHalf}>
            <Text style={styles.label}>Lot Size</Text>
            <TextInput
              style={styles.input}
              value={newProduct.lot_size?.toString()}
              onChangeText={(text) => setNewProduct({...newProduct, lot_size: parseFloat(text) || 0})}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.formGroupHalf}>
            <Text style={styles.label}>Unit</Text>
            <TextInput
              style={styles.input}
              value={newProduct.unit}
              onChangeText={(text) => setNewProduct({...newProduct, unit: text})}
              placeholder="kg"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Quality Grade</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gradeSelector}>
            {['Premium', 'A', 'B', 'C'].map(grade => (
              <TouchableOpacity
                key={grade}
                style={[
                  styles.gradeSelectorButton,
                  newProduct.quality_grade === grade && styles.gradeSelectorButtonActive
                ]}
                onPress={() => setNewProduct({...newProduct, quality_grade: grade as any})}
              >
                <Text style={[
                  styles.gradeSelectorButtonText,
                  newProduct.quality_grade === grade && styles.gradeSelectorButtonTextActive
                ]}>
                  {grade}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={newProduct.location}
            onChangeText={(text) => setNewProduct({...newProduct, location: text})}
            placeholder="City, Country"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={newProduct.description}
            onChangeText={(text) => setNewProduct({...newProduct, description: text})}
            placeholder="Describe your product..."
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addProduct}>
          <Text style={styles.addButtonText}>Add Product</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'funded': return '#22C55E';
      case 'pending': return '#F59E0B';
      case 'disputed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Phase B Marketplace</Text>
        <Text style={styles.subtitle}>Quality grading, escrow payments & enhanced catalog</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.activeTab]}
          onPress={() => setActiveTab('products')}
        >
          <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
            Products
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'escrow' && styles.activeTab]}
          onPress={() => setActiveTab('escrow')}
        >
          <Text style={[styles.tabText, activeTab === 'escrow' && styles.activeTabText]}>
            Escrow
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'add_product' && styles.activeTab]}
          onPress={() => setActiveTab('add_product')}
        >
          <Text style={[styles.tabText, activeTab === 'add_product' && styles.activeTabText]}>
            Add Product
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'products' && renderProducts()}
      {activeTab === 'escrow' && renderEscrow()}
      {activeTab === 'add_product' && renderAddProduct()}
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
  searchContainer: {
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
  gradeFilter: {
    flexDirection: 'row',
  },
  gradeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  gradeButtonActive: {
    backgroundColor: '#228B22',
  },
  gradeButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  gradeButtonTextActive: {
    color: 'white',
  },
  productList: {
    flex: 1,
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
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  gradeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gradeTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 20,
  },
  productDetails: {
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#228B22',
    marginBottom: 4,
  },
  productLot: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  productLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  productSeller: {
    fontSize: 14,
    color: '#6B7280',
  },
  certificateContainer: {
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  certificateText: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '500',
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  escrowButton: {
    backgroundColor: '#228B22',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  escrowButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  escrowList: {
    flex: 1,
  },
  escrowCard: {
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
  escrowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  escrowId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  escrowAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#228B22',
    marginBottom: 16,
  },
  milestonesContainer: {
    marginTop: 8,
  },
  milestonesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  milestoneItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  milestoneAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#228B22',
    marginBottom: 4,
  },
  milestoneStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  form: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  formGroupHalf: {
    flex: 0.48,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  gradeSelector: {
    flexDirection: 'row',
  },
  gradeSelectorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  gradeSelectorButtonActive: {
    backgroundColor: '#228B22',
    borderColor: '#228B22',
  },
  gradeSelectorButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  gradeSelectorButtonTextActive: {
    color: 'white',
  },
  addButton: {
    backgroundColor: '#228B22',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PhaseBMarketplace;
