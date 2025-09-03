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
} from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';

const { width } = Dimensions.get('window');

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'virtual' | 'physical' | 'hybrid';
  category: 'meetup' | 'auction' | 'procurement_fair' | 'training' | 'workshop' | 'conference';
  date: string;
  time: string;
  duration_minutes: number;
  location?: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  virtual_link?: string;
  organizer: {
    id: string;
    name: string;
    organization?: string;
    avatar?: string;
  };
  capacity: number;
  registered_count: number;
  registration_fee: number;
  currency: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  tags: string[];
  requirements: string[];
  agenda: EventAgendaItem[];
  speakers: EventSpeaker[];
  sponsors: EventSponsor[];
  registration_deadline: string;
  created_at: string;
  updated_at: string;
}

interface EventAgendaItem {
  id: string;
  time: string;
  title: string;
  description: string;
  speaker_id?: string;
  duration_minutes: number;
  type: 'presentation' | 'discussion' | 'break' | 'networking' | 'demo';
}

interface EventSpeaker {
  id: string;
  name: string;
  title: string;
  organization: string;
  bio: string;
  avatar?: string;
  expertise: string[];
  social_links: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

interface EventSponsor {
  id: string;
  name: string;
  logo: string;
  website: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  description: string;
}

interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  registration_date: string;
  status: 'registered' | 'attended' | 'no_show' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  special_requirements?: string;
  dietary_restrictions?: string[];
  t_shirt_size?: string;
}

interface EventFeedback {
  id: string;
  event_id: string;
  user_id: string;
  rating: number;
  feedback: string;
  would_recommend: boolean;
  favorite_session?: string;
  improvement_suggestions: string;
  submitted_at: string;
}

const EventsManagement: React.FC = () => {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [feedback, setFeedback] = useState<EventFeedback[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'my_events' | 'past' | 'create'>('upcoming');
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const currentUserId = 'user_123';

  useEffect(() => {
    loadEventsData();
  }, []);

  const loadEventsData = async () => {
    try {
      setLoading(true);
      const eventsData = await offlineStorageService.getOfflineDataByType('events').then(data => 
        data.length > 0 ? data.map(d => d.data) : getSampleEvents()
      );
      const registrationsData = await offlineStorageService.getOfflineDataByType('event_registrations').then(data => 
        data.length > 0 ? data.map(d => d.data) : getSampleRegistrations()
      );
      const feedbackData = await offlineStorageService.getOfflineDataByType('event_feedback').then(data => 
        data.length > 0 ? data.map(d => d.data) : []
      );
      
      setEvents(eventsData);
      setRegistrations(registrationsData);
      setFeedback(feedbackData);
    } catch (error) {
      console.error('Error loading events data:', error);
      setEvents(getSampleEvents());
      setRegistrations(getSampleRegistrations());
      setFeedback([]);
    } finally {
      setLoading(false);
    }
  };

  const getSampleEvents = (): CommunityEvent[] => [
    {
      id: 'event_001',
      title: 'Smart Farming Technologies Summit 2024',
      description: 'Join leading experts in agricultural technology for a comprehensive summit covering IoT sensors, AI diagnostics, and precision farming techniques.',
      type: 'hybrid',
      category: 'conference',
      date: '2024-03-15',
      time: '09:00',
      duration_minutes: 480,
      location: {
        address: 'Nairobi Convention Centre, Nairobi, Kenya',
        coordinates: { latitude: -1.2921, longitude: 36.8219 }
      },
      virtual_link: 'https://zoom.us/j/123456789',
      organizer: {
        id: 'org_001',
        name: 'Kenya Agricultural Research Institute',
        organization: 'KARI',
        avatar: 'https://example.com/kari-logo.png'
      },
      capacity: 500,
      registered_count: 342,
      registration_fee: 50,
      currency: 'USD',
      status: 'upcoming',
      tags: ['technology', 'IoT', 'AI', 'precision-farming'],
      requirements: ['Laptop recommended', 'Basic farming knowledge'],
      agenda: [
        {
          id: 'agenda_001',
          time: '09:00',
          title: 'Registration & Welcome Coffee',
          description: 'Network with fellow farmers and tech enthusiasts',
          duration_minutes: 60,
          type: 'networking'
        },
        {
          id: 'agenda_002',
          time: '10:00',
          title: 'Keynote: The Future of Agriculture',
          description: 'Vision for sustainable farming in the digital age',
          speaker_id: 'speaker_001',
          duration_minutes: 45,
          type: 'presentation'
        }
      ],
      speakers: [
        {
          id: 'speaker_001',
          name: 'Dr. Sarah Mwangi',
          title: 'Director of Agricultural Innovation',
          organization: 'KARI',
          bio: 'Leading researcher in precision agriculture with 15+ years experience',
          avatar: 'https://example.com/sarah-avatar.jpg',
          expertise: ['Precision Agriculture', 'IoT', 'Crop Science'],
          social_links: {
            linkedin: 'https://linkedin.com/in/sarah-mwangi',
            twitter: 'https://twitter.com/sarahmwangi'
          }
        }
      ],
      sponsors: [
        {
          id: 'sponsor_001',
          name: 'ZundeNova AgriTech',
          logo: 'https://example.com/zundenova-logo.png',
          website: 'https://zundenova.com',
          tier: 'platinum',
          description: 'Leading agricultural technology platform'
        }
      ],
      registration_deadline: '2024-03-10',
      created_at: '2024-02-01T10:00:00Z',
      updated_at: '2024-02-15T14:30:00Z'
    },
    {
      id: 'event_002',
      title: 'Livestock Auction Day',
      description: 'Monthly livestock auction featuring cattle, goats, and poultry from certified farmers.',
      type: 'physical',
      category: 'auction',
      date: '2024-03-20',
      time: '08:00',
      duration_minutes: 360,
      location: {
        address: 'Nakuru Livestock Market, Nakuru, Kenya',
        coordinates: { latitude: -0.3031, longitude: 36.0800 }
      },
      organizer: {
        id: 'org_002',
        name: 'Nakuru Farmers Cooperative',
        organization: 'NFC'
      },
      capacity: 200,
      registered_count: 156,
      registration_fee: 10,
      currency: 'USD',
      status: 'upcoming',
      tags: ['livestock', 'auction', 'cattle', 'trading'],
      requirements: ['Valid ID', 'Payment method'],
      agenda: [],
      speakers: [],
      sponsors: [],
      registration_deadline: '2024-03-18',
      created_at: '2024-02-10T08:00:00Z',
      updated_at: '2024-02-20T12:00:00Z'
    }
  ];

  const getSampleRegistrations = (): EventRegistration[] => [
    {
      id: 'reg_001',
      event_id: 'event_001',
      user_id: currentUserId,
      user_name: 'John Farmer',
      user_email: 'john@example.com',
      registration_date: '2024-02-20T10:00:00Z',
      status: 'registered',
      payment_status: 'paid',
      special_requirements: 'Wheelchair accessible seating',
      dietary_restrictions: ['vegetarian'],
      t_shirt_size: 'L'
    }
  ];

  const saveEventsData = async () => {
    try {
      await offlineStorageService.storeOfflineData({
        id: 'events_data',
        type: 'events' as any,
        data: events
      });
      await offlineStorageService.storeOfflineData({
        id: 'event_registrations_data',
        type: 'event_registrations' as any,
        data: registrations
      });
      await offlineStorageService.storeOfflineData({
        id: 'event_feedback_data',
        type: 'event_feedback' as any,
        data: feedback
      });
    } catch (error) {
      console.error('Error saving events data:', error);
    }
  };

  const registerForEvent = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (event.registered_count >= event.capacity) {
      Alert.alert('Event Full', 'This event has reached maximum capacity.');
      return;
    }

    const existingRegistration = registrations.find(
      r => r.event_id === eventId && r.user_id === currentUserId
    );

    if (existingRegistration) {
      Alert.alert('Already Registered', 'You are already registered for this event.');
      return;
    }

    const newRegistration: EventRegistration = {
      id: `reg_${Date.now()}`,
      event_id: eventId,
      user_id: currentUserId,
      user_name: 'Current User',
      user_email: 'user@example.com',
      registration_date: new Date().toISOString(),
      status: 'registered',
      payment_status: event.registration_fee > 0 ? 'pending' : 'paid'
    };

    const updatedEvents = events.map(e => 
      e.id === eventId 
        ? { ...e, registered_count: e.registered_count + 1 }
        : e
    );

    setRegistrations([...registrations, newRegistration]);
    setEvents(updatedEvents);
    await saveEventsData();
    
    Alert.alert('Success', 'Successfully registered for the event!');
  };

  const submitFeedback = async (eventId: string, rating: number, feedbackText: string) => {
    const newFeedback: EventFeedback = {
      id: `feedback_${Date.now()}`,
      event_id: eventId,
      user_id: currentUserId,
      rating,
      feedback: feedbackText,
      would_recommend: rating >= 4,
      improvement_suggestions: '',
      submitted_at: new Date().toISOString()
    };

    setFeedback([...feedback, newFeedback]);
    await saveEventsData();
    setShowFeedbackModal(false);
    Alert.alert('Thank You', 'Your feedback has been submitted!');
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    const matchesType = filterType === 'all' || event.type === filterType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const getMyEvents = () => {
    const myEventIds = registrations
      .filter(r => r.user_id === currentUserId)
      .map(r => r.event_id);
    
    return events.filter(e => myEventIds.includes(e.id));
  };

  const getPastEvents = () => {
    const now = new Date();
    return events.filter(e => new Date(e.date) < now);
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events.filter(e => new Date(e.date) >= now);
  };

  const renderEventCard = (event: CommunityEvent) => {
    const isRegistered = registrations.some(
      r => r.event_id === event.id && r.user_id === currentUserId
    );

    return (
      <View key={event.id} style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
            <Text style={styles.statusText}>{event.status.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.eventDescription} numberOfLines={2}>
          {event.description}
        </Text>

        <View style={styles.eventMeta}>
          <Text style={styles.eventDate}>📅 {event.date} at {event.time}</Text>
          <Text style={styles.eventLocation}>
            {event.type === 'virtual' ? '💻 Virtual' : 
             event.type === 'physical' ? `📍 ${event.location?.address}` : 
             '🔄 Hybrid'}
          </Text>
          <Text style={styles.eventCapacity}>
            👥 {event.registered_count}/{event.capacity} registered
          </Text>
        </View>

        <View style={styles.eventTags}>
          {event.tags.slice(0, 3).map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.eventActions}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => {
              setSelectedEvent(event);
              setShowEventModal(true);
            }}
          >
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>

          {!isRegistered && event.status === 'upcoming' && (
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => registerForEvent(event.id)}
            >
              <Text style={styles.registerButtonText}>
                {event.registration_fee > 0 ? `Register ($${event.registration_fee})` : 'Register Free'}
              </Text>
            </TouchableOpacity>
          )}

          {isRegistered && (
            <View style={styles.registeredBadge}>
              <Text style={styles.registeredText}>✓ Registered</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#22C55E';
      case 'ongoing': return '#F59E0B';
      case 'completed': return '#6B7280';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderEventModal = () => {
    if (!selectedEvent) return null;

    return (
      <Modal
        visible={showEventModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowEventModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.eventDescription}>{selectedEvent.description}</Text>

            <View style={styles.eventDetails}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>
                {selectedEvent.date} at {selectedEvent.time} ({selectedEvent.duration_minutes} minutes)
              </Text>

              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>
                {selectedEvent.type === 'virtual' ? 'Virtual Event' : 
                 selectedEvent.location?.address || 'TBD'}
              </Text>

              <Text style={styles.detailLabel}>Organizer</Text>
              <Text style={styles.detailValue}>
                {selectedEvent.organizer.name}
                {selectedEvent.organizer.organization && ` (${selectedEvent.organizer.organization})`}
              </Text>

              <Text style={styles.detailLabel}>Registration Fee</Text>
              <Text style={styles.detailValue}>
                {selectedEvent.registration_fee > 0 
                  ? `$${selectedEvent.registration_fee} ${selectedEvent.currency}`
                  : 'Free'}
              </Text>
            </View>

            {selectedEvent.agenda.length > 0 && (
              <View style={styles.agendaSection}>
                <Text style={styles.sectionTitle}>Agenda</Text>
                {selectedEvent.agenda.map(item => (
                  <View key={item.id} style={styles.agendaItem}>
                    <Text style={styles.agendaTime}>{item.time}</Text>
                    <View style={styles.agendaContent}>
                      <Text style={styles.agendaTitle}>{item.title}</Text>
                      <Text style={styles.agendaDescription}>{item.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {selectedEvent.speakers.length > 0 && (
              <View style={styles.speakersSection}>
                <Text style={styles.sectionTitle}>Speakers</Text>
                {selectedEvent.speakers.map(speaker => (
                  <View key={speaker.id} style={styles.speakerCard}>
                    <Text style={styles.speakerName}>{speaker.name}</Text>
                    <Text style={styles.speakerTitle}>
                      {speaker.title} at {speaker.organization}
                    </Text>
                    <Text style={styles.speakerBio}>{speaker.bio}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Events</Text>
        <Text style={styles.subtitle}>Connect, learn & network</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, filterCategory === 'all' && styles.activeFilter]}
            onPress={() => setFilterCategory('all')}
          >
            <Text style={[styles.filterText, filterCategory === 'all' && styles.activeFilterText]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterCategory === 'conference' && styles.activeFilter]}
            onPress={() => setFilterCategory('conference')}
          >
            <Text style={[styles.filterText, filterCategory === 'conference' && styles.activeFilterText]}>
              Conferences
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterCategory === 'auction' && styles.activeFilter]}
            onPress={() => setFilterCategory('auction')}
          >
            <Text style={[styles.filterText, filterCategory === 'auction' && styles.activeFilterText]}>
              Auctions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterCategory === 'training' && styles.activeFilter]}
            onPress={() => setFilterCategory('training')}
          >
            <Text style={[styles.filterText, filterCategory === 'training' && styles.activeFilterText]}>
              Training
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming ({getUpcomingEvents().length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my_events' && styles.activeTab]}
          onPress={() => setActiveTab('my_events')}
        >
          <Text style={[styles.tabText, activeTab === 'my_events' && styles.activeTabText]}>
            My Events ({getMyEvents().length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Past ({getPastEvents().length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.eventsContainer}>
        {activeTab === 'upcoming' && getUpcomingEvents().map(renderEventCard)}
        {activeTab === 'my_events' && getMyEvents().map(renderEventCard)}
        {activeTab === 'past' && getPastEvents().map(renderEventCard)}
        
        {filteredEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No events found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}
      </ScrollView>

      {renderEventModal()}
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#228B22',
  },
  filterText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
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
  eventsContainer: {
    flex: 1,
    padding: 16,
  },
  eventCard: {
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
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  eventMeta: {
    marginBottom: 12,
  },
  eventDate: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  eventCapacity: {
    fontSize: 14,
    color: '#374151',
  },
  eventTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  registerButton: {
    backgroundColor: '#228B22',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  registeredBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  registeredText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#065F46',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#228B22',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  eventDetails: {
    marginBottom: 24,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  agendaSection: {
    marginBottom: 24,
  },
  agendaItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  agendaTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#228B22',
    width: 60,
  },
  agendaContent: {
    flex: 1,
    marginLeft: 12,
  },
  agendaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  agendaDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  speakersSection: {
    marginBottom: 24,
  },
  speakerCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  speakerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  speakerTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  speakerBio: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});

export default EventsManagement;
