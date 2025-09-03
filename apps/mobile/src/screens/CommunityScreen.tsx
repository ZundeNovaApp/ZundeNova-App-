import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

export default function CommunityScreen() {
  const [selectedTab, setSelectedTab] = useState<'forums' | 'qa' | 'events' | 'mentors'>('forums');

  const forumTopics = [
    {
      id: '1',
      title: 'Best practices for maize farming in dry season',
      author: 'John Farmer',
      replies: 12,
      lastActivity: '2 hours ago',
      category: 'Crop Management'
    },
    {
      id: '2',
      title: 'Organic pest control methods',
      author: 'Mary Green',
      replies: 8,
      lastActivity: '5 hours ago',
      category: 'Pest Control'
    },
    {
      id: '3',
      title: 'Market prices for tomatoes this week',
      author: 'Peter Trade',
      replies: 15,
      lastActivity: '1 day ago',
      category: 'Market Info'
    }
  ];

  const qaItems = [
    {
      id: '1',
      question: 'When is the best time to plant beans?',
      author: 'Sarah K.',
      answers: 3,
      solved: true,
      timeAgo: '3 hours ago'
    },
    {
      id: '2',
      question: 'How to treat leaf curl in tomatoes?',
      author: 'David M.',
      answers: 1,
      solved: false,
      timeAgo: '6 hours ago'
    }
  ];

  const events = [
    {
      id: '1',
      title: 'Agricultural Fair 2024',
      date: 'Oct 15, 2024',
      location: 'Nairobi Expo Center',
      attendees: 245,
      type: 'Physical'
    },
    {
      id: '2',
      title: 'Sustainable Farming Webinar',
      date: 'Oct 20, 2024',
      location: 'Online',
      attendees: 89,
      type: 'Virtual'
    }
  ];

  const mentors = [
    {
      id: '1',
      name: 'Dr. James Mwangi',
      expertise: 'Crop Disease Management',
      rating: 4.9,
      sessions: 156,
      available: true
    },
    {
      id: '2',
      name: 'Prof. Grace Wanjiku',
      expertise: 'Livestock Health',
      rating: 4.8,
      sessions: 203,
      available: false
    }
  ];

  const renderForums = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Forum Discussions</Text>
        <TouchableOpacity style={styles.newPostButton}>
          <Text style={styles.newPostButtonText}>+ New Topic</Text>
        </TouchableOpacity>
      </View>

      {forumTopics.map(topic => (
        <TouchableOpacity key={topic.id} style={styles.forumCard}>
          <View style={styles.forumHeader}>
            <Text style={styles.forumTitle}>{topic.title}</Text>
            <Text style={styles.forumCategory}>{topic.category}</Text>
          </View>
          <View style={styles.forumFooter}>
            <Text style={styles.forumAuthor}>by {topic.author}</Text>
            <Text style={styles.forumStats}>{topic.replies} replies • {topic.lastActivity}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderQA = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Questions & Answers</Text>
        <TouchableOpacity style={styles.newPostButton}>
          <Text style={styles.newPostButtonText}>+ Ask Question</Text>
        </TouchableOpacity>
      </View>

      {qaItems.map(item => (
        <TouchableOpacity key={item.id} style={styles.qaCard}>
          <View style={styles.qaHeader}>
            <Text style={styles.qaQuestion}>{item.question}</Text>
            {item.solved && <Text style={styles.solvedBadge}>✓ Solved</Text>}
          </View>
          <View style={styles.qaFooter}>
            <Text style={styles.qaAuthor}>by {item.author}</Text>
            <Text style={styles.qaStats}>{item.answers} answers • {item.timeAgo}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderEvents = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Upcoming Events</Text>

      {events.map(event => (
        <View key={event.id} style={styles.eventCard}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventType}>{event.type}</Text>
          </View>
          <Text style={styles.eventDate}>📅 {event.date}</Text>
          <Text style={styles.eventLocation}>📍 {event.location}</Text>
          <View style={styles.eventFooter}>
            <Text style={styles.eventAttendees}>{event.attendees} attending</Text>
            <TouchableOpacity style={styles.rsvpButton}>
              <Text style={styles.rsvpButtonText}>RSVP</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderMentors = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Lead Farmers & Mentors</Text>

      {mentors.map(mentor => (
        <View key={mentor.id} style={styles.mentorCard}>
          <View style={styles.mentorHeader}>
            <Text style={styles.mentorName}>{mentor.name}</Text>
            <Text style={[styles.availabilityStatus, { color: mentor.available ? '#10B981' : '#dc3545' }]}>
              {mentor.available ? '🟢 Available' : '🔴 Busy'}
            </Text>
          </View>
          <Text style={styles.mentorExpertise}>{mentor.expertise}</Text>
          <View style={styles.mentorStats}>
            <Text style={styles.mentorRating}>⭐ {mentor.rating}</Text>
            <Text style={styles.mentorSessions}>{mentor.sessions} sessions</Text>
          </View>
          <TouchableOpacity 
            style={[styles.connectButton, !mentor.available && styles.disabledButton]}
            disabled={!mentor.available}
          >
            <Text style={styles.connectButtonText}>Connect</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community</Text>
      
      <View style={styles.tabBar}>
        {['forums', 'qa', 'events', 'mentors'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab as any)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
              {tab === 'qa' ? 'Q&A' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedTab === 'forums' && renderForums()}
      {selectedTab === 'qa' && renderQA()}
      {selectedTab === 'events' && renderEvents()}
      {selectedTab === 'mentors' && renderMentors()}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  newPostButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newPostButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  forumCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  forumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  forumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  forumCategory: {
    fontSize: 12,
    color: '#10B981',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  forumFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forumAuthor: {
    fontSize: 14,
    color: '#666',
  },
  forumStats: {
    fontSize: 12,
    color: '#999',
  },
  qaCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  qaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  qaQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  solvedBadge: {
    fontSize: 12,
    color: '#10B981',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  qaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qaAuthor: {
    fontSize: 14,
    color: '#666',
  },
  qaStats: {
    fontSize: 12,
    color: '#999',
  },
  eventCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  eventType: {
    fontSize: 12,
    color: '#10B981',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventAttendees: {
    fontSize: 14,
    color: '#666',
  },
  rsvpButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  rsvpButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  mentorCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  mentorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  mentorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  availabilityStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  mentorExpertise: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  mentorStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  mentorRating: {
    fontSize: 14,
    color: '#F59E0B',
  },
  mentorSessions: {
    fontSize: 14,
    color: '#666',
  },
  connectButton: {
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
