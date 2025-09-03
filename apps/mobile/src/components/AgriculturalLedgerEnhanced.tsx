import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { offlineStorageService } from '../services/OfflineStorageService';

const { width } = Dimensions.get('window');

interface FinancialTransaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  subcategory: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  payment_method: 'cash' | 'mobile_money' | 'bank_transfer' | 'credit' | 'barter';
  reference_number?: string;
  farm_activity_id?: string;
  crop_id?: string;
  livestock_id?: string;
  supplier_buyer_name?: string;
  receipt_photo?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  tax_applicable: boolean;
  tax_amount?: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

interface Budget {
  id: string;
  name: string;
  period: 'monthly' | 'quarterly' | 'seasonal' | 'annual';
  start_date: string;
  end_date: string;
  categories: BudgetCategory[];
  total_planned_income: number;
  total_planned_expenses: number;
  total_actual_income: number;
  total_actual_expenses: number;
  status: 'active' | 'completed' | 'draft';
  created_at: string;
}

interface BudgetCategory {
  category: string;
  planned_amount: number;
  actual_amount: number;
  variance: number;
  variance_percentage: number;
}

interface CashflowForecast {
  id: string;
  period: string;
  opening_balance: number;
  projected_income: number;
  projected_expenses: number;
  closing_balance: number;
  cash_surplus_deficit: number;
  confidence_level: number;
  assumptions: string[];
  created_at: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  type: 'sales' | 'purchase';
  customer_supplier_name: string;
  customer_supplier_contact: string;
  issue_date: string;
  due_date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  payment_terms: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payment_date?: string;
  notes?: string;
  created_at: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  tax_rate: number;
}

interface FinancialReport {
  period: string;
  total_income: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
  income_by_category: { [key: string]: number };
  expenses_by_category: { [key: string]: number };
  cash_flow: number;
  roi: number;
  break_even_point: number;
}

const AgriculturalLedgerEnhanced: React.FC = () => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [cashflowForecasts, setCashflowForecasts] = useState<CashflowForecast[]>([]);
  const [activeTab, setActiveTab] = useState<'transactions' | 'budget' | 'cashflow' | 'invoices' | 'reports'>('transactions');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentReport, setCurrentReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(true);

  const [transactionForm, setTransactionForm] = useState({
    type: 'expense' as 'income' | 'expense',
    category: '',
    amount: '',
    description: '',
    payment_method: 'cash' as any,
    date: new Date().toISOString().split('T')[0]
  });

  const incomeCategories = [
    'Crop Sales', 'Livestock Sales', 'Dairy Products', 'Eggs', 'Honey',
    'Agritourism', 'Equipment Rental', 'Consulting Services', 'Subsidies',
    'Insurance Claims', 'Other Income'
  ];

  const expenseCategories = [
    'Seeds & Seedlings', 'Fertilizers', 'Pesticides', 'Feed', 'Veterinary',
    'Fuel & Energy', 'Equipment Purchase', 'Equipment Maintenance', 'Labor',
    'Land Rent', 'Insurance', 'Transportation', 'Marketing', 'Professional Services',
    'Taxes', 'Other Expenses'
  ];

  useEffect(() => {
    loadFinancialData();
  }, []);

  useEffect(() => {
    generateFinancialReport();
  }, [transactions, selectedPeriod]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      
      const transactionsData = await offlineStorageService.getOfflineDataByType('financial').then(data => 
        data.length > 0 ? data.map(d => d.data) : getSampleTransactions()
      );
      setTransactions(transactionsData);

      const budgetsData = await offlineStorageService.getOfflineDataByType('budgets').then(data => 
        data.length > 0 ? data.map(d => d.data) : getSampleBudgets()
      );
      setBudgets(budgetsData);

      const invoicesData = await offlineStorageService.getOfflineDataByType('invoices').then(data => 
        data.length > 0 ? data.map(d => d.data) : getSampleInvoices()
      );
      setInvoices(invoicesData);

      const forecastsData = await offlineStorageService.getOfflineDataByType('cashflow').then(data => 
        data.length > 0 ? data.map(d => d.data) : getSampleCashflowForecasts()
      );
      setCashflowForecasts(forecastsData);

    } catch (error) {
      console.error('Error loading financial data:', error);
      setTransactions(getSampleTransactions());
      setBudgets(getSampleBudgets());
      setInvoices(getSampleInvoices());
      setCashflowForecasts(getSampleCashflowForecasts());
    } finally {
      setLoading(false);
    }
  };

  const getSampleTransactions = (): FinancialTransaction[] => [
    {
      id: 'txn_001',
      type: 'income',
      category: 'Crop Sales',
      subcategory: 'Maize',
      amount: 1500,
      currency: 'USD',
      date: '2024-03-01',
      description: 'Sold 50 bags of maize to local market',
      payment_method: 'mobile_money',
      supplier_buyer_name: 'Central Market',
      tax_applicable: true,
      tax_amount: 150,
      status: 'completed',
      created_at: '2024-03-01T10:00:00Z',
      updated_at: '2024-03-01T10:00:00Z'
    },
    {
      id: 'txn_002',
      type: 'expense',
      category: 'Fertilizers',
      subcategory: 'NPK',
      amount: 300,
      currency: 'USD',
      date: '2024-02-15',
      description: 'Purchased NPK fertilizer for maize field',
      payment_method: 'cash',
      supplier_buyer_name: 'AgriSupply Co.',
      tax_applicable: false,
      status: 'completed',
      created_at: '2024-02-15T14:30:00Z',
      updated_at: '2024-02-15T14:30:00Z'
    },
    {
      id: 'txn_003',
      type: 'expense',
      category: 'Labor',
      subcategory: 'Harvesting',
      amount: 200,
      currency: 'USD',
      date: '2024-02-28',
      description: 'Payment for harvest labor - 5 workers for 2 days',
      payment_method: 'cash',
      tax_applicable: false,
      status: 'completed',
      created_at: '2024-02-28T18:00:00Z',
      updated_at: '2024-02-28T18:00:00Z'
    }
  ];

  const getSampleBudgets = (): Budget[] => [
    {
      id: 'budget_001',
      name: '2024 Maize Season Budget',
      period: 'seasonal',
      start_date: '2024-01-01',
      end_date: '2024-06-30',
      categories: [
        { category: 'Seeds & Seedlings', planned_amount: 500, actual_amount: 480, variance: -20, variance_percentage: -4 },
        { category: 'Fertilizers', planned_amount: 800, actual_amount: 850, variance: 50, variance_percentage: 6.25 },
        { category: 'Labor', planned_amount: 1200, actual_amount: 1100, variance: -100, variance_percentage: -8.33 }
      ],
      total_planned_income: 5000,
      total_planned_expenses: 2500,
      total_actual_income: 4800,
      total_actual_expenses: 2430,
      status: 'active',
      created_at: '2024-01-01T00:00:00Z'
    }
  ];

  const getSampleInvoices = (): Invoice[] => [
    {
      id: 'inv_001',
      invoice_number: 'INV-2024-001',
      type: 'sales',
      customer_supplier_name: 'Green Valley Cooperative',
      customer_supplier_contact: '+1234567890',
      issue_date: '2024-03-01',
      due_date: '2024-03-15',
      items: [
        {
          id: 'item_001',
          description: 'Premium Maize - Grade A',
          quantity: 100,
          unit: 'bags',
          unit_price: 30,
          total_price: 3000,
          tax_rate: 10
        }
      ],
      subtotal: 3000,
      tax_amount: 300,
      discount_amount: 0,
      total_amount: 3300,
      currency: 'USD',
      payment_terms: 'Net 15 days',
      status: 'sent',
      created_at: '2024-03-01T09:00:00Z'
    }
  ];

  const getSampleCashflowForecasts = (): CashflowForecast[] => [
    {
      id: 'forecast_001',
      period: '2024-04',
      opening_balance: 2000,
      projected_income: 3500,
      projected_expenses: 2800,
      closing_balance: 2700,
      cash_surplus_deficit: 700,
      confidence_level: 0.85,
      assumptions: [
        'Maize harvest will yield 150 bags',
        'Market price will remain stable at $30/bag',
        'No major equipment repairs needed'
      ],
      created_at: '2024-03-15T12:00:00Z'
    }
  ];

  const saveFinancialData = async () => {
    try {
      await offlineStorageService.storeOfflineData({
        id: 'financial_transactions',
        type: 'financial' as any,
        data: transactions
      });
      await offlineStorageService.storeOfflineData({
        id: 'budgets_data',
        type: 'budgets' as any,
        data: budgets
      });
      await offlineStorageService.storeOfflineData({
        id: 'invoices_data',
        type: 'invoices' as any,
        data: invoices
      });
      await offlineStorageService.storeOfflineData({
        id: 'cashflow_forecasts',
        type: 'cashflow' as any,
        data: cashflowForecasts
      });
    } catch (error) {
      console.error('Error saving financial data:', error);
    }
  };

  const addTransaction = async () => {
    if (!transactionForm.amount || !transactionForm.category || !transactionForm.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const newTransaction: FinancialTransaction = {
      id: `txn_${Date.now()}`,
      type: transactionForm.type,
      category: transactionForm.category,
      subcategory: '',
      amount: parseFloat(transactionForm.amount),
      currency: 'USD',
      date: transactionForm.date,
      description: transactionForm.description,
      payment_method: transactionForm.payment_method,
      tax_applicable: false,
      status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setTransactions([...transactions, newTransaction]);
    await saveFinancialData();
    
    setTransactionForm({
      type: 'expense',
      category: '',
      amount: '',
      description: '',
      payment_method: 'cash',
      date: new Date().toISOString().split('T')[0]
    });
    
    setShowTransactionModal(false);
    Alert.alert('Success', 'Transaction added successfully');
  };

  const generateFinancialReport = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (selectedPeriod) {
      case 'current_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'current_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const filteredTransactions = transactions.filter(txn => {
      const txnDate = new Date(txn.date);
      return txnDate >= startDate && txnDate <= endDate && txn.status === 'completed';
    });

    const totalIncome = filteredTransactions
      .filter(txn => txn.type === 'income')
      .reduce((sum, txn) => sum + txn.amount, 0);

    const totalExpenses = filteredTransactions
      .filter(txn => txn.type === 'expense')
      .reduce((sum, txn) => sum + txn.amount, 0);

    const incomeByCategory: { [key: string]: number } = {};
    const expensesByCategory: { [key: string]: number } = {};

    filteredTransactions.forEach(txn => {
      if (txn.type === 'income') {
        incomeByCategory[txn.category] = (incomeByCategory[txn.category] || 0) + txn.amount;
      } else {
        expensesByCategory[txn.category] = (expensesByCategory[txn.category] || 0) + txn.amount;
      }
    });

    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    const report: FinancialReport = {
      period: selectedPeriod,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net_profit: netProfit,
      profit_margin: profitMargin,
      income_by_category: incomeByCategory,
      expenses_by_category: expensesByCategory,
      cash_flow: netProfit,
      roi: totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0,
      break_even_point: totalExpenses
    };

    setCurrentReport(report);
  };

  const getFilteredTransactions = () => {
    let filtered = transactions;
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(txn => txn.category === filterCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(txn => 
        txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const renderTransactions = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, filterCategory === 'all' && styles.activeFilterButton]}
            onPress={() => setFilterCategory('all')}
          >
            <Text style={[styles.filterButtonText, filterCategory === 'all' && styles.activeFilterButtonText]}>
              All
            </Text>
          </TouchableOpacity>
          {[...incomeCategories, ...expenseCategories].map(category => (
            <TouchableOpacity
              key={category}
              style={[styles.filterButton, filterCategory === category && styles.activeFilterButton]}
              onPress={() => setFilterCategory(category)}
            >
              <Text style={[styles.filterButtonText, filterCategory === category && styles.activeFilterButtonText]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.transactionsList}>
        {getFilteredTransactions().map(transaction => (
          <View key={transaction.id} style={styles.transactionCard}>
            <View style={styles.transactionHeader}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionCategory}>{transaction.category}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <View style={styles.transactionAmount}>
                <Text style={[
                  styles.amountText,
                  { color: transaction.type === 'income' ? '#10B981' : '#EF4444' }
                ]}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </Text>
                <Text style={styles.paymentMethod}>{transaction.payment_method}</Text>
              </View>
            </View>
            <Text style={styles.transactionDescription}>{transaction.description}</Text>
            {transaction.supplier_buyer_name && (
              <Text style={styles.supplierBuyer}>
                {transaction.type === 'income' ? 'Buyer' : 'Supplier'}: {transaction.supplier_buyer_name}
              </Text>
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={() => setShowTransactionModal(true)}>
        <Text style={styles.addButtonText}>+ Add Transaction</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderReports = () => {
    if (!currentReport) return null;

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.periodSelector}>
          <Picker
            selectedValue={selectedPeriod}
            onValueChange={setSelectedPeriod}
            style={styles.picker}
          >
            <Picker.Item label="Current Month" value="current_month" />
            <Picker.Item label="Last Month" value="last_month" />
            <Picker.Item label="Current Year" value="current_year" />
          </Picker>
        </View>

        <View style={styles.reportCard}>
          <Text style={styles.reportTitle}>Financial Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>${currentReport.total_income.toFixed(2)}</Text>
              <Text style={styles.summaryLabel}>Total Income</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>${currentReport.total_expenses.toFixed(2)}</Text>
              <Text style={styles.summaryLabel}>Total Expenses</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[
                styles.summaryValue,
                { color: currentReport.net_profit >= 0 ? '#10B981' : '#EF4444' }
              ]}>
                ${currentReport.net_profit.toFixed(2)}
              </Text>
              <Text style={styles.summaryLabel}>Net Profit</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{currentReport.profit_margin.toFixed(1)}%</Text>
              <Text style={styles.summaryLabel}>Profit Margin</Text>
            </View>
          </View>
        </View>

        <View style={styles.reportCard}>
          <Text style={styles.reportTitle}>Income by Category</Text>
          {Object.entries(currentReport.income_by_category).map(([category, amount]) => (
            <View key={category} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{category}</Text>
              <Text style={styles.categoryAmount}>${amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.reportCard}>
          <Text style={styles.reportTitle}>Expenses by Category</Text>
          {Object.entries(currentReport.expenses_by_category).map(([category, amount]) => (
            <View key={category} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{category}</Text>
              <Text style={styles.categoryAmount}>${amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.reportCard}>
          <Text style={styles.reportTitle}>Key Metrics</Text>
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Return on Investment</Text>
              <Text style={styles.metricValue}>{currentReport.roi.toFixed(1)}%</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Break-even Point</Text>
              <Text style={styles.metricValue}>${currentReport.break_even_point.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderCashflow = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Cashflow Forecasts</Text>
      {cashflowForecasts.map(forecast => (
        <View key={forecast.id} style={styles.forecastCard}>
          <Text style={styles.forecastPeriod}>Period: {forecast.period}</Text>
          <View style={styles.forecastDetails}>
            <View style={styles.forecastRow}>
              <Text style={styles.forecastLabel}>Opening Balance:</Text>
              <Text style={styles.forecastValue}>${forecast.opening_balance.toFixed(2)}</Text>
            </View>
            <View style={styles.forecastRow}>
              <Text style={styles.forecastLabel}>Projected Income:</Text>
              <Text style={[styles.forecastValue, { color: '#10B981' }]}>
                +${forecast.projected_income.toFixed(2)}
              </Text>
            </View>
            <View style={styles.forecastRow}>
              <Text style={styles.forecastLabel}>Projected Expenses:</Text>
              <Text style={[styles.forecastValue, { color: '#EF4444' }]}>
                -${forecast.projected_expenses.toFixed(2)}
              </Text>
            </View>
            <View style={styles.forecastRow}>
              <Text style={styles.forecastLabel}>Closing Balance:</Text>
              <Text style={[
                styles.forecastValue,
                { color: forecast.closing_balance >= 0 ? '#10B981' : '#EF4444' }
              ]}>
                ${forecast.closing_balance.toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>
              Confidence: {Math.round(forecast.confidence_level * 100)}%
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Agricultural Ledger</Text>
        <Text style={styles.subtitle}>Smart financial management</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>
            Transactions
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
          onPress={() => setActiveTab('reports')}
        >
          <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>
            Reports
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'cashflow' && styles.activeTab]}
          onPress={() => setActiveTab('cashflow')}
        >
          <Text style={[styles.tabText, activeTab === 'cashflow' && styles.activeTabText]}>
            Cashflow
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'transactions' && renderTransactions()}
      {activeTab === 'reports' && renderReports()}
      {activeTab === 'cashflow' && renderCashflow()}

      {/* Transaction Modal */}
      <Modal visible={showTransactionModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Transaction</Text>
            <TouchableOpacity onPress={() => setShowTransactionModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Type</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeButton, transactionForm.type === 'income' && styles.activeTypeButton]}
                  onPress={() => setTransactionForm({...transactionForm, type: 'income'})}
                >
                  <Text style={[styles.typeButtonText, transactionForm.type === 'income' && styles.activeTypeButtonText]}>
                    Income
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, transactionForm.type === 'expense' && styles.activeTypeButton]}
                  onPress={() => setTransactionForm({...transactionForm, type: 'expense'})}
                >
                  <Text style={[styles.typeButtonText, transactionForm.type === 'expense' && styles.activeTypeButtonText]}>
                    Expense
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <Picker
                selectedValue={transactionForm.category}
                onValueChange={(value) => setTransactionForm({...transactionForm, category: value})}
                style={styles.picker}
              >
                <Picker.Item label="Select Category" value="" />
                {(transactionForm.type === 'income' ? incomeCategories : expenseCategories).map(category => (
                  <Picker.Item key={category} label={category} value={category} />
                ))}
              </Picker>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Amount ($)</Text>
              <TextInput
                style={styles.formInput}
                value={transactionForm.amount}
                onChangeText={(text) => setTransactionForm({...transactionForm, amount: text})}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={styles.formInput}
                value={transactionForm.description}
                onChangeText={(text) => setTransactionForm({...transactionForm, description: text})}
                placeholder="Enter description"
                multiline
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Payment Method</Text>
              <Picker
                selectedValue={transactionForm.payment_method}
                onValueChange={(value) => setTransactionForm({...transactionForm, payment_method: value})}
                style={styles.picker}
              >
                <Picker.Item label="Cash" value="cash" />
                <Picker.Item label="Mobile Money" value="mobile_money" />
                <Picker.Item label="Bank Transfer" value="bank_transfer" />
                <Picker.Item label="Credit" value="credit" />
              </Picker>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Date</Text>
              <TextInput
                style={styles.formInput}
                value={transactionForm.date}
                onChangeText={(text) => setTransactionForm({...transactionForm, date: text})}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={addTransaction}>
              <Text style={styles.submitButtonText}>Add Transaction</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#228B22',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E5E7EB',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#228B22',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#228B22',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#228B22',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  transactionsList: {
    marginBottom: 16,
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  paymentMethod: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
  transactionDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  supplierBuyer: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: '#228B22',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  periodSelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  picker: {
    height: 50,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryName: {
    fontSize: 16,
    color: '#374151',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  metricsContainer: {
    gap: 16,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 16,
    color: '#374151',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#228B22',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  forecastCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  forecastPeriod: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  forecastDetails: {
    marginBottom: 12,
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  forecastLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  forecastValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  confidenceContainer: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    backgroundColor: '#228B22',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTypeButton: {
    backgroundColor: '#228B22',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTypeButtonText: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#228B22',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AgriculturalLedgerEnhanced;
