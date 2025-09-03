import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';

interface FinancialLedgerProps {
  farmId: string;
  onDataUpdated: (data: any) => void;
}

export default function FinancialLedger({ farmId, onDataUpdated }: FinancialLedgerProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'income' | 'expenses' | 'forecast'>('overview');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [newTransaction, setNewTransaction] = useState({
    type: 'income',
    amount: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    loadFinancialData();
  }, [farmId]);

  const loadFinancialData = async () => {
    const mockTransactions = [
      {
        id: '1',
        type: 'income',
        amount: 1500,
        currency: 'USD',
        date: new Date('2024-08-15'),
        description: 'Maize harvest sale',
        category: 'Crop Sales',
        cropId: 'crop1'
      },
      {
        id: '2',
        type: 'expense',
        amount: 250,
        currency: 'USD',
        date: new Date('2024-08-10'),
        description: 'NPK Fertilizer purchase',
        category: 'Inputs',
        paymentMethod: 'Mobile Money'
      },
      {
        id: '3',
        type: 'income',
        amount: 800,
        currency: 'USD',
        date: new Date('2024-08-05'),
        description: 'Tomato sales',
        category: 'Crop Sales',
        cropId: 'crop2'
      },
      {
        id: '4',
        type: 'expense',
        amount: 150,
        currency: 'USD',
        date: new Date('2024-08-01'),
        description: 'Veterinary consultation',
        category: 'Livestock Care',
        livestockId: 'livestock1'
      }
    ];

    setTransactions(mockTransactions);
  };

  const addTransaction = async () => {
    if (!newTransaction.amount || !newTransaction.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const transaction = {
      id: `trans_${Date.now()}`,
      farmId,
      type: newTransaction.type,
      amount: parseFloat(newTransaction.amount),
      currency: 'USD',
      date: new Date(),
      description: newTransaction.description,
      category: newTransaction.category || 'General',
      paymentMethod: 'Cash'
    };

    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);

    await offlineStorageService.storeOfflineData({
      id: `financial_${transaction.id}`,
      type: 'farm',
      data: transaction
    });

    setNewTransaction({
      type: 'income',
      amount: '',
      description: '',
      category: ''
    });

    Alert.alert('Success', 'Transaction added successfully!');
  };

  const calculateTotals = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expenses, profit: income - expenses };
  };

  const renderOverview = () => {
    const totals = calculateTotals();
    
    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Financial Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={styles.incomeAmount}>${totals.income.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={styles.expenseAmount}>${totals.expenses.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.profitRow]}>
            <Text style={styles.summaryLabel}>Net Profit</Text>
            <Text style={[styles.profitAmount, { color: totals.profit >= 0 ? '#10B981' : '#dc3545' }]}>
              ${totals.profit.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => setSelectedTab('income')}>
            <Text style={styles.actionButtonText}>💰 Record Income</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setSelectedTab('expenses')}>
            <Text style={styles.actionButtonText}>💸 Record Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setSelectedTab('forecast')}>
            <Text style={styles.actionButtonText}>📊 View Forecast</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentTransactions}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {transactions.slice(0, 5).map(transaction => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <Text style={styles.transactionDescription}>{transaction.description}</Text>
                <Text style={[
                  styles.transactionAmount,
                  { color: transaction.type === 'income' ? '#10B981' : '#dc3545' }
                ]}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.transactionDate}>
                {transaction.date.toLocaleDateString()} • {transaction.category}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderTransactionForm = (type: 'income' | 'expense') => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Add {type === 'income' ? 'Income' : 'Expense'}</Text>
      
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Amount (USD)</Text>
          <TextInput
            style={styles.textInput}
            value={newTransaction.amount}
            onChangeText={(text) => setNewTransaction({ ...newTransaction, amount: text })}
            placeholder="0.00"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={styles.textInput}
            value={newTransaction.description}
            onChangeText={(text) => setNewTransaction({ ...newTransaction, description: text })}
            placeholder="Enter description"
            multiline
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Category</Text>
          <TextInput
            style={styles.textInput}
            value={newTransaction.category}
            onChangeText={(text) => setNewTransaction({ ...newTransaction, category: text })}
            placeholder="e.g., Crop Sales, Inputs, Labor"
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => {
            setNewTransaction({ ...newTransaction, type });
            addTransaction();
          }}
        >
          <Text style={styles.submitButtonText}>Add {type === 'income' ? 'Income' : 'Expense'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderForecast = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Cashflow Forecast</Text>
      
      <View style={styles.forecastCard}>
        <Text style={styles.forecastTitle}>Next 3 Months Projection</Text>
        
        <View style={styles.forecastRow}>
          <Text style={styles.forecastLabel}>Expected Income</Text>
          <Text style={styles.forecastIncome}>$4,200</Text>
        </View>
        
        <View style={styles.forecastRow}>
          <Text style={styles.forecastLabel}>Planned Expenses</Text>
          <Text style={styles.forecastExpense}>$2,800</Text>
        </View>
        
        <View style={styles.forecastRow}>
          <Text style={styles.forecastLabel}>Net Cashflow</Text>
          <Text style={styles.forecastProfit}>$1,400</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>💳 Apply for Input Financing</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>🛡️ Get Crop Insurance</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Financial Management</Text>
      
      <View style={styles.tabBar}>
        {['overview', 'income', 'expenses', 'forecast'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab as any)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedTab === 'overview' && renderOverview()}
      {selectedTab === 'income' && renderTransactionForm('income')}
      {selectedTab === 'expenses' && renderTransactionForm('expense')}
      {selectedTab === 'forecast' && renderForecast()}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#10B981',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  profitRow: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 10,
    marginTop: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  incomeAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  profitAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickActions: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  recentTransactions: {
    marginTop: 20,
  },
  transactionCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  formContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forecastCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  forecastTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  forecastLabel: {
    fontSize: 16,
    color: '#666',
  },
  forecastIncome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  forecastExpense: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  forecastProfit: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
});
