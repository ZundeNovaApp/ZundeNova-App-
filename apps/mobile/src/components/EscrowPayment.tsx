import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';

interface EscrowPaymentProps {
  orderId: string;
  orderAmount: number;
  onEscrowComplete: (result: any) => void;
}

export default function EscrowPayment({ orderId, orderAmount, onEscrowComplete }: EscrowPaymentProps) {
  const [escrowStatus, setEscrowStatus] = useState<'setup' | 'funded' | 'released' | 'disputed'>('setup');
  const [milestones, setMilestones] = useState([
    { id: 1, description: 'Order Confirmation', percentage: 20, status: 'pending' },
    { id: 2, description: 'Goods Shipped', percentage: 30, status: 'pending' },
    { id: 3, description: 'Quality Inspection', percentage: 30, status: 'pending' },
    { id: 4, description: 'Delivery Confirmed', percentage: 20, status: 'pending' }
  ]);

  const setupEscrow = async () => {
    const escrowData = {
      id: `escrow_${Date.now()}`,
      orderId,
      totalAmount: orderAmount,
      currency: 'USD',
      status: 'funded',
      milestones: milestones.map(m => ({
        ...m,
        amount: (orderAmount * m.percentage) / 100
      })),
      createdAt: new Date(),
      fundedAt: new Date()
    };

    await offlineStorageService.storeOfflineData({
      id: `escrow_${escrowData.id}`,
      type: 'marketplace',
      data: escrowData
    });

    setEscrowStatus('funded');
    Alert.alert('Success', 'Escrow account has been funded successfully!');
  };

  const releaseMilestone = async (milestoneId: number) => {
    const updatedMilestones = milestones.map(m =>
      m.id === milestoneId ? { ...m, status: 'completed', releasedAt: new Date() } : m
    );
    setMilestones(updatedMilestones);

    const milestone = milestones.find(m => m.id === milestoneId);
    if (milestone) {
      await offlineStorageService.storeOfflineData({
        id: `milestone_release_${Date.now()}`,
        type: 'marketplace',
        data: {
          orderId,
          milestoneId,
          amount: (orderAmount * milestone.percentage) / 100,
          releasedAt: new Date()
        }
      });

      Alert.alert('Milestone Released', `Payment of $${((orderAmount * milestone.percentage) / 100).toFixed(2)} has been released.`);
    }

    const allCompleted = updatedMilestones.every(m => m.status === 'completed');
    if (allCompleted) {
      setEscrowStatus('released');
      onEscrowComplete({ status: 'completed', totalReleased: orderAmount });
    }
  };

  const disputeEscrow = async () => {
    setEscrowStatus('disputed');
    
    await offlineStorageService.storeOfflineData({
      id: `dispute_${Date.now()}`,
      type: 'marketplace',
      data: {
        orderId,
        disputedAt: new Date(),
        reason: 'Quality issues reported',
        status: 'under_review'
      }
    });

    Alert.alert('Dispute Filed', 'Your dispute has been submitted for review. Our team will investigate within 24 hours.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'setup': return '#6b7280';
      case 'funded': return '#3b82f6';
      case 'released': return '#10b981';
      case 'disputed': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Escrow Payment</Text>
      <Text style={styles.subtitle}>Secure milestone-based payments</Text>

      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Escrow Status</Text>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(escrowStatus) }]} />
        </View>
        <Text style={[styles.statusText, { color: getStatusColor(escrowStatus) }]}>
          {escrowStatus.toUpperCase()}
        </Text>
        <Text style={styles.orderAmount}>Total Amount: ${orderAmount.toFixed(2)}</Text>
      </View>

      {escrowStatus === 'setup' && (
        <View style={styles.setupCard}>
          <Text style={styles.cardTitle}>Setup Escrow Account</Text>
          <Text style={styles.setupDescription}>
            Funds will be held securely and released based on milestone completion.
          </Text>
          <TouchableOpacity style={styles.setupButton} onPress={setupEscrow}>
            <Text style={styles.setupButtonText}>Fund Escrow Account</Text>
          </TouchableOpacity>
        </View>
      )}

      {escrowStatus !== 'setup' && (
        <View style={styles.milestonesCard}>
          <Text style={styles.cardTitle}>Payment Milestones</Text>
          {milestones.map(milestone => (
            <View key={milestone.id} style={styles.milestoneItem}>
              <View style={styles.milestoneHeader}>
                <Text style={styles.milestoneDescription}>{milestone.description}</Text>
                <View style={[
                  styles.milestoneStatus,
                  { backgroundColor: getMilestoneStatusColor(milestone.status) }
                ]} />
              </View>
              <View style={styles.milestoneDetails}>
                <Text style={styles.milestonePercentage}>{milestone.percentage}%</Text>
                <Text style={styles.milestoneAmount}>
                  ${((orderAmount * milestone.percentage) / 100).toFixed(2)}
                </Text>
              </View>
              {milestone.status === 'pending' && escrowStatus === 'funded' && (
                <TouchableOpacity
                  style={styles.releaseButton}
                  onPress={() => releaseMilestone(milestone.id)}
                >
                  <Text style={styles.releaseButtonText}>Release Payment</Text>
                </TouchableOpacity>
              )}
              {milestone.status === 'completed' && (
                <View style={styles.completedIndicator}>
                  <Text style={styles.completedText}>✅ Payment Released</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {escrowStatus === 'funded' && (
        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Escrow Actions</Text>
          <TouchableOpacity style={styles.disputeButton} onPress={disputeEscrow}>
            <Text style={styles.disputeButtonText}>File Dispute</Text>
          </TouchableOpacity>
          <Text style={styles.disputeNote}>
            Only file a dispute if there are genuine issues with the order quality or delivery.
          </Text>
        </View>
      )}

      {escrowStatus === 'disputed' && (
        <View style={styles.disputeCard}>
          <Text style={styles.cardTitle}>Dispute Under Review</Text>
          <Text style={styles.disputeText}>
            Your dispute has been submitted and is being reviewed by our team. 
            You will be contacted within 24 hours with an update.
          </Text>
          <View style={styles.disputeSteps}>
            <Text style={styles.disputeStep}>1. Evidence collection</Text>
            <Text style={styles.disputeStep}>2. Expert review</Text>
            <Text style={styles.disputeStep}>3. Resolution decision</Text>
            <Text style={styles.disputeStep}>4. Fund distribution</Text>
          </View>
        </View>
      )}

      {escrowStatus === 'released' && (
        <View style={styles.completedCard}>
          <Text style={styles.completedTitle}>🎉 Transaction Complete!</Text>
          <Text style={styles.completedText}>
            All milestones have been completed and payments have been released successfully.
          </Text>
          <TouchableOpacity style={styles.receiptButton}>
            <Text style={styles.receiptButtonText}>Download Receipt</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#228B22',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  statusCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  orderAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  setupCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  setupDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  setupButton: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  setupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  milestonesCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  milestoneItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  milestoneDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  milestoneStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  milestoneDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  milestonePercentage: {
    fontSize: 14,
    color: '#666',
  },
  milestoneAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  releaseButton: {
    backgroundColor: '#10B981',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  releaseButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  completedIndicator: {
    backgroundColor: '#dcfce7',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  completedText: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  disputeButton: {
    backgroundColor: '#dc2626',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  disputeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disputeNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  disputeCard: {
    backgroundColor: '#fef2f2',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  disputeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  disputeSteps: {
    marginTop: 10,
  },
  disputeStep: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  completedCard: {
    backgroundColor: '#dcfce7',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 15,
  },
  receiptButton: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  receiptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
