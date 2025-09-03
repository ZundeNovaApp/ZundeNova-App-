import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';

interface FinancialRecord {
  id: string;
  date: Date;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string;
  description: string;
  farmId: string;
  attachments?: string[];
}

interface CashflowForecast {
  month: string;
  projectedIncome: number;
  projectedExpenses: number;
  netCashflow: number;
  cumulativeCashflow: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdDate: Date;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function AgriculturalLedger({ farmId }: { farmId: string }) {
  const [view, setView] = useState<'overview' | 'records' | 'forecast' | 'invoices'>('overview');
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<FinancialRecord>>({
    type: 'expense',
    category: 'Seeds',
    currency: 'USD',
    farmId
  });
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    status: 'draft'
  });

  useEffect(() => {
    loadFinancialData();
  }, [farmId]);

  const loadFinancialData = async () => {
    try {
      const financialData = await offlineStorageService.getOfflineDataByType('financial');
      const farmRecords = financialData.filter(data => data.data.farmId === farmId);
      
      const recordsData = farmRecords.filter(data => data.data.type === 'income' || data.data.type === 'expense');
      const invoicesData = farmRecords.filter(data => data.data.invoiceNumber);
      
      setRecords(recordsData.map(data => data.data));
      setInvoices(invoicesData.map(data => data.data));
    } catch (error) {
      console.error('Failed to load financial data:', error);
    }
  };

  const addFinancialRecord = async () => {
    if (!newRecord.amount || !newRecord.description || !newRecord.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const record: FinancialRecord = {
      id: `record_${Date.now()}`,
      date: new Date(),
      type: newRecord.type!,
      category: newRecord.category!,
      amount: newRecord.amount!,
      currency: newRecord.currency!,
      description: newRecord.description!,
      farmId
    };

    try {
      await offlineStorageService.storeOfflineData({
        id: record.id,
        type: 'financial',
        data: record
      });

      setRecords([...records, record]);
      setNewRecord({ type: 'expense', category: 'Seeds', currency: 'USD', farmId });
      setShowAddRecord(false);
      Alert.alert('Success', 'Financial record added successfully');
    } catch (error) {
      console.error('Failed to add financial record:', error);
      Alert.alert('Error', 'Failed to add financial record');
    }
  };

  const generateCashflowForecast = (): CashflowForecast[] => {
    const forecast: CashflowForecast[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    let cumulativeCashflow = 0;

    const avgMonthlyIncome = records
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0) / 6;
    
    const avgMonthlyExpenses = records
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0) / 6;

    months.forEach(month => {
      const projectedIncome = avgMonthlyIncome * (0.8 + Math.random() * 0.4);
      const projectedExpenses = avgMonthlyExpenses * (0.9 + Math.random() * 0.2);
      const netCashflow = projectedIncome - projectedExpenses;
      cumulativeCashflow += netCashflow;

      forecast.push({
        month,
        projectedIncome,
        projectedExpenses,
        netCashflow,
        cumulativeCashflow
      });
    });

    return forecast;
  };

  const createInvoice = async () => {
    if (!newInvoice.customerName || !newInvoice.items?.[0]?.description) {
      Alert.alert('Error', 'Please fill in customer name and at least one item');
      return;
    }

    const subtotal = newInvoice.items!.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const invoice: Invoice = {
      id: `invoice_${Date.now()}`,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      customerName: newInvoice.customerName!,
      items: newInvoice.items!,
      subtotal,
      tax,
      total,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'draft',
      createdDate: new Date()
    };

    try {
      await offlineStorageService.storeOfflineData({
        id: invoice.id,
        type: 'financial',
        data: invoice
      });

      setInvoices([...invoices, invoice]);
      setNewInvoice({ items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }], status: 'draft' });
      setShowCreateInvoice(false);
      Alert.alert('Success', 'Invoice created successfully');
    } catch (error) {
      console.error('Failed to create invoice:', error);
      Alert.alert('Error', 'Failed to create invoice');
    }
  };

  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...(newInvoice.items || [])];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setNewInvoice({ ...newInvoice, items: updatedItems });
  };

  const renderOverview = () => {
    const totalIncome = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const pendingInvoices = invoices.filter(i => i.status === 'sent').length;

    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Financial Overview</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${totalIncome.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Income</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${totalExpenses.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Expenses</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: netProfit >= 0 ? '#e8f5e8' : '#ffeaea' }]}>
            <Text style={[styles.statValue, { color: netProfit >= 0 ? '#228B22' : '#dc2626' }]}>
              ${netProfit.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Net Profit</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{pendingInvoices}</Text>
            <Text style={styles.statLabel}>Pending Invoices</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowAddRecord(true)}>
            <Text style={styles.actionButtonText}>💰 Add Record</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowCreateInvoice(true)}>
            <Text style={styles.actionButtonText}>📄 Create Invoice</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {records.slice(-5).reverse().map(record => (
            <View key={record.id} style={styles.transactionItem}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>{record.description}</Text>
                <Text style={styles.transactionCategory}>{record.category}</Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: record.type === 'income' ? '#10B981' : '#dc2626' }
              ]}>
                {record.type === 'income' ? '+' : '-'}${record.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderCashflowForecast = () => {
    const forecast = generateCashflowForecast();

    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>6-Month Cashflow Forecast</Text>
        
        {forecast.map(month => (
          <View key={month.month} style={styles.forecastCard}>
            <Text style={styles.forecastMonth}>{month.month}</Text>
            <View style={styles.forecastDetails}>
              <View style={styles.forecastRow}>
                <Text style={styles.forecastLabel}>Projected Income:</Text>
                <Text style={[styles.forecastValue, { color: '#10B981' }]}>
                  +${month.projectedIncome.toFixed(2)}
                </Text>
              </View>
              <View style={styles.forecastRow}>
                <Text style={styles.forecastLabel}>Projected Expenses:</Text>
                <Text style={[styles.forecastValue, { color: '#dc2626' }]}>
                  -${month.projectedExpenses.toFixed(2)}
                </Text>
              </View>
              <View style={styles.forecastRow}>
                <Text style={styles.forecastLabel}>Net Cashflow:</Text>
                <Text style={[
                  styles.forecastValue,
                  { color: month.netCashflow >= 0 ? '#10B981' : '#dc2626', fontWeight: 'bold' }
                ]}>
                  ${month.netCashflow.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderAddRecordModal = () => {
    if (!showAddRecord) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Financial Record</Text>
          
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, newRecord.type === 'income' && styles.selectedType]}
              onPress={() => setNewRecord({ ...newRecord, type: 'income' })}
            >
              <Text style={styles.typeButtonText}>Income</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, newRecord.type === 'expense' && styles.selectedType]}
              onPress={() => setNewRecord({ ...newRecord, type: 'expense' })}
            >
              <Text style={styles.typeButtonText}>Expense</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Amount"
            value={newRecord.amount?.toString() || ''}
            onChangeText={(text) => setNewRecord({ ...newRecord, amount: parseFloat(text) || 0 })}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Description"
            value={newRecord.description || ''}
            onChangeText={(text) => setNewRecord({ ...newRecord, description: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Category"
            value={newRecord.category || ''}
            onChangeText={(text) => setNewRecord({ ...newRecord, category: text })}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddRecord(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={addFinancialRecord}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, view === 'overview' && styles.activeTab]}
          onPress={() => setView('overview')}
        >
          <Text style={[styles.tabText, view === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, view === 'forecast' && styles.activeTab]}
          onPress={() => setView('forecast')}
        >
          <Text style={[styles.tabText, view === 'forecast' && styles.activeTabText]}>Forecast</Text>
        </TouchableOpacity>
      </View>

      {view === 'overview' && renderOverview()}
      {view === 'forecast' && renderCashflowForecast()}
      {renderAddRecordModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#228B22',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#228B22',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#228B22',
    textAlign: 'center',
    marginVertical: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    flex: 0.48,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#228B22',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  recentActivity: {
    paddingHorizontal: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  transactionCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  forecastCard: {
    backgroundColor: '#f8f9fa',
    margin: 20,
    padding: 20,
    borderRadius: 15,
  },
  forecastMonth: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#228B22',
    marginBottom: 15,
  },
  forecastDetails: {
    gap: 10,
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forecastLabel: {
    fontSize: 14,
    color: '#666',
  },
  forecastValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#228B22',
    textAlign: 'center',
    marginBottom: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: '#e8f5e8',
    borderWidth: 1,
    borderColor: '#228B22',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#228B22',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});
