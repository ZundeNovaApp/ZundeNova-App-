import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Modal, Image } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';

interface Mentor {
  id: string;
  user_id: string;
  name: string;
  profile_image?: string;
  location: string;
  specializations: string[];
  experience_years: number;
  farm_size_hectares: number;
  crops_grown: string[];
  livestock_types: string[];
  certifications: string[];
  languages: string[];
  rating: {
    average: number;
    count: number;
    distribution: {
      [stars: number]: number;
    };
  };
  mentorship_stats: {
    total_mentees: number;
    active_mentees: number;
    completed_sessions: number;
    success_rate: number;
    response_time_hours: number;
  };
  availability: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
    timezone: string;
  };
  pricing: {
    hourly_rate: number;
    currency: string;
    packages: MentorshipPackage[];
  };
  verification: {
    verified: boolean;
    verification_date?: string;
    verification_type: 'field_visit' | 'document_review' | 'peer_recommendation';
  };
  performance_metrics: {
    knowledge_score: number;
    communication_score: number;
    reliability_score: number;
    impact_score: number;
  };
  bio: string;
  achievements: string[];
  created_at: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface MentorshipPackage {
  id: string;
  name: string;
  description: string;
  duration_weeks: number;
  sessions_included: number;
  price: number;
  currency: string;
  features: string[];
  popular: boolean;
}

interface MentorshipSession {
  id: string;
  mentor_id: string;
  mentee_id: string;
  package_id?: string;
  title: string;
  description: string;
  scheduled_date: string;
  duration_minutes: number;
  session_type: 'video_call' | 'phone_call' | 'field_visit' | 'chat' | 'group_session';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  meeting_link?: string;
  location?: string;
  agenda: string[];
  materials: string[];
  notes?: string;
  feedback?: SessionFeedback;
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
}

interface SessionFeedback {
  mentee_rating: number;
  mentee_comment: string;
  mentor_rating: number;
  mentor_comment: string;
  goals_achieved: boolean;
  follow_up_needed: boolean;
  next_steps: string[];
  submitted_at: string;
}

interface MentorshipProgram {
  id: string;
  name: string;
  description: string;
  category: string;
  target_audience: string[];
  duration_weeks: number;
  mentor_requirements: {
    min_experience_years: number;
    required_specializations: string[];
    min_rating: number;
    verification_required: boolean;
  };
  curriculum: ProgramModule[];
  incentive_structure: {
    base_commission: number;
    performance_bonus: number;
    completion_bonus: number;
    revenue_share: number;
  };
  enrollment_criteria: {
    max_mentees_per_mentor: number;
    application_required: boolean;
    prerequisites: string[];
  };
  success_metrics: {
    completion_rate_target: number;
    satisfaction_score_target: number;
    knowledge_improvement_target: number;
  };
  created_by: string;
  created_at: string;
  status: 'active' | 'inactive' | 'draft';
}

interface ProgramModule {
  id: string;
  title: string;
  description: string;
  week: number;
  learning_objectives: string[];
  activities: string[];
  deliverables: string[];
  resources: string[];
}

interface LeadFarmerProgram {
  id: string;
  name: string;
  description: string;
  region: string;
  crop_focus: string[];
  selection_criteria: {
    min_farm_size: number;
    min_experience_years: number;
    min_yield_performance: number;
    community_standing: boolean;
    technology_adoption: boolean;
  };
  responsibilities: string[];
  benefits: {
    monthly_stipend: number;
    training_opportunities: string[];
    equipment_access: string[];
    market_access_support: boolean;
  };
  performance_kpis: {
    farmers_trained: number;
    adoption_rate: number;
    yield_improvement: number;
    knowledge_retention: number;
  };
  revenue_sharing: {
    input_sales_commission: number;
    equipment_rental_commission: number;
    training_fee_share: number;
    referral_bonus: number;
  };
  support_structure: {
    regional_coordinator: string;
    technical_support: string[];
    marketing_support: boolean;
  };
  created_at: string;
  status: 'active' | 'inactive';
}

export const PeerMentoringSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mentors' | 'sessions' | 'programs' | 'lead_farmers'>('mentors');
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [programs, setPrograms] = useState<MentorshipProgram[]>([]);
  const [leadFarmerPrograms, setLeadFarmerPrograms] = useState<LeadFarmerProgram[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'price' | 'availability'>('rating');
  const [currentUserId] = useState('user_001'); // Current user context

  useEffect(() => {
    loadMentoringData();
  }, []);

  const loadMentoringData = async () => {
    try {
      const mentorsData = await offlineStorageService.getOfflineDataByType('mentors');
      const sessionsData = await offlineStorageService.getOfflineDataByType('mentorship_sessions');
      const programsData = await offlineStorageService.getOfflineDataByType('mentorship_programs');
      const leadFarmerData = await offlineStorageService.getOfflineDataByType('lead_farmer_programs');
      
      if (mentorsData.length > 0) {
        setMentors(mentorsData[0].data);
      } else {
        setMentors(getSampleMentors());
      }
      
      if (sessionsData.length > 0) {
        setSessions(sessionsData[0].data);
      } else {
        setSessions(getSampleSessions());
      }
      
      if (programsData.length > 0) {
        setPrograms(programsData[0].data);
      } else {
        setPrograms(getSamplePrograms());
      }
      
      if (leadFarmerData.length > 0) {
        setLeadFarmerPrograms(leadFarmerData[0].data);
      } else {
        setLeadFarmerPrograms(getSampleLeadFarmerPrograms());
      }
    } catch (error) {
      console.error('Failed to load mentoring data:', error);
    }
  };

  const getSampleMentors = (): Mentor[] => [
    {
      id: 'mentor_001',
      user_id: 'user_mentor_001',
      name: 'Sarah Mwangi',
      profile_image: 'sarah_profile.jpg',
      location: 'Nakuru, Kenya',
      specializations: ['Sustainable Agriculture', 'Crop Rotation', 'Organic Farming'],
      experience_years: 15,
      farm_size_hectares: 25,
      crops_grown: ['Maize', 'Beans', 'Tomatoes', 'Kale'],
      livestock_types: ['Dairy Cattle', 'Poultry'],
      certifications: ['Organic Certification', 'Master Farmer Certificate'],
      languages: ['English', 'Swahili', 'Kikuyu'],
      rating: {
        average: 4.8,
        count: 127,
        distribution: {
          5: 98,
          4: 22,
          3: 5,
          2: 1,
          1: 1
        }
      },
      mentorship_stats: {
        total_mentees: 45,
        active_mentees: 12,
        completed_sessions: 234,
        success_rate: 92.5,
        response_time_hours: 2.3
      },
      availability: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday'],
        hours: {
          start: '08:00',
          end: '17:00'
        },
        timezone: 'EAT'
      },
      pricing: {
        hourly_rate: 25,
        currency: 'USD',
        packages: [
          {
            id: 'pkg_001',
            name: 'Starter Package',
            description: 'Perfect for new farmers getting started',
            duration_weeks: 4,
            sessions_included: 4,
            price: 80,
            currency: 'USD',
            features: ['Weekly 1-hour sessions', 'WhatsApp support', 'Farm planning template'],
            popular: false
          },
          {
            id: 'pkg_002',
            name: 'Growth Package',
            description: 'Comprehensive support for expanding operations',
            duration_weeks: 12,
            sessions_included: 12,
            price: 250,
            currency: 'USD',
            features: ['Weekly sessions', '24/7 WhatsApp support', 'Farm visit', 'Business plan review'],
            popular: true
          }
        ]
      },
      verification: {
        verified: true,
        verification_date: '2024-01-15T00:00:00Z',
        verification_type: 'field_visit'
      },
      performance_metrics: {
        knowledge_score: 95,
        communication_score: 92,
        reliability_score: 98,
        impact_score: 89
      },
      bio: 'Experienced sustainable agriculture practitioner with 15+ years of hands-on farming experience. Specializes in helping smallholder farmers transition to organic and sustainable practices while maintaining profitability.',
      achievements: [
        'Increased average mentee yields by 35%',
        'Helped 30+ farmers achieve organic certification',
        'Regional winner - Best Mentor Award 2023'
      ],
      created_at: '2023-06-01T00:00:00Z',
      status: 'active'
    },
    {
      id: 'mentor_002',
      user_id: 'user_mentor_002',
      name: 'John Ochieng',
      profile_image: 'john_profile.jpg',
      location: 'Kisumu, Kenya',
      specializations: ['Livestock Management', 'Dairy Farming', 'Feed Formulation'],
      experience_years: 20,
      farm_size_hectares: 40,
      crops_grown: ['Napier Grass', 'Maize', 'Sorghum'],
      livestock_types: ['Dairy Cattle', 'Goats', 'Sheep'],
      certifications: ['Veterinary Assistant Certificate', 'Livestock Management Diploma'],
      languages: ['English', 'Swahili', 'Luo'],
      rating: {
        average: 4.6,
        count: 89,
        distribution: {
          5: 65,
          4: 18,
          3: 4,
          2: 1,
          1: 1
        }
      },
      mentorship_stats: {
        total_mentees: 32,
        active_mentees: 8,
        completed_sessions: 156,
        success_rate: 88.2,
        response_time_hours: 3.1
      },
      availability: {
        days: ['Monday', 'Wednesday', 'Thursday', 'Friday', 'Sunday'],
        hours: {
          start: '06:00',
          end: '18:00'
        },
        timezone: 'EAT'
      },
      pricing: {
        hourly_rate: 30,
        currency: 'USD',
        packages: [
          {
            id: 'pkg_003',
            name: 'Livestock Basics',
            description: 'Foundation course for livestock farming',
            duration_weeks: 6,
            sessions_included: 6,
            price: 150,
            currency: 'USD',
            features: ['Weekly sessions', 'Feeding guides', 'Health monitoring sheets'],
            popular: false
          },
          {
            id: 'pkg_004',
            name: 'Dairy Excellence',
            description: 'Advanced dairy farming techniques',
            duration_weeks: 16,
            sessions_included: 16,
            price: 400,
            currency: 'USD',
            features: ['Bi-weekly sessions', 'Farm visits', 'Breeding program design', 'Market linkage support'],
            popular: true
          }
        ]
      },
      verification: {
        verified: true,
        verification_date: '2023-08-20T00:00:00Z',
        verification_type: 'document_review'
      },
      performance_metrics: {
        knowledge_score: 92,
        communication_score: 87,
        reliability_score: 94,
        impact_score: 91
      },
      bio: 'Livestock specialist with two decades of experience in dairy and small ruminant farming. Expert in feed formulation, breeding programs, and dairy value chain development.',
      achievements: [
        'Improved average milk production by 40% for mentees',
        'Established 5 farmer cooperatives',
        'Trained over 200 farmers in livestock management'
      ],
      created_at: '2023-07-15T00:00:00Z',
      status: 'active'
    },
    {
      id: 'mentor_003',
      user_id: 'user_mentor_003',
      name: 'Grace Wanjiku',
      profile_image: 'grace_profile.jpg',
      location: 'Meru, Kenya',
      specializations: ['Horticulture', 'Greenhouse Farming', 'Post-Harvest Handling'],
      experience_years: 12,
      farm_size_hectares: 8,
      crops_grown: ['Tomatoes', 'Capsicum', 'Cucumbers', 'French Beans'],
      livestock_types: [],
      certifications: ['Horticulture Diploma', 'GlobalGAP Certification'],
      languages: ['English', 'Swahili', 'Kimeru'],
      rating: {
        average: 4.9,
        count: 156,
        distribution: {
          5: 142,
          4: 11,
          3: 2,
          2: 1,
          1: 0
        }
      },
      mentorship_stats: {
        total_mentees: 67,
        active_mentees: 18,
        completed_sessions: 298,
        success_rate: 95.1,
        response_time_hours: 1.8
      },
      availability: {
        days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        hours: {
          start: '07:00',
          end: '16:00'
        },
        timezone: 'EAT'
      },
      pricing: {
        hourly_rate: 35,
        currency: 'USD',
        packages: [
          {
            id: 'pkg_005',
            name: 'Greenhouse Starter',
            description: 'Complete guide to greenhouse farming',
            duration_weeks: 8,
            sessions_included: 8,
            price: 220,
            currency: 'USD',
            features: ['Weekly sessions', 'Greenhouse setup guide', 'Crop calendar', 'Pest management plan'],
            popular: true
          }
        ]
      },
      verification: {
        verified: true,
        verification_date: '2023-09-10T00:00:00Z',
        verification_type: 'peer_recommendation'
      },
      performance_metrics: {
        knowledge_score: 97,
        communication_score: 95,
        reliability_score: 96,
        impact_score: 93
      },
      bio: 'Greenhouse farming expert specializing in high-value horticultural crops. Passionate about helping farmers maximize returns through intensive farming techniques and proper post-harvest handling.',
      achievements: [
        'Highest rated mentor for 3 consecutive quarters',
        'Helped mentees achieve 300% ROI on greenhouse investments',
        'Developed standardized greenhouse farming curriculum'
      ],
      created_at: '2023-05-20T00:00:00Z',
      status: 'active'
    }
  ];

  const getSampleSessions = (): MentorshipSession[] => [
    {
      id: 'session_001',
      mentor_id: 'mentor_001',
      mentee_id: 'user_001',
      package_id: 'pkg_002',
      title: 'Farm Planning and Crop Selection',
      description: 'Initial consultation to assess current farming practices and plan for the upcoming season',
      scheduled_date: '2024-03-15T10:00:00Z',
      duration_minutes: 60,
      session_type: 'video_call',
      status: 'completed',
      meeting_link: 'https://meet.zundenova.com/session_001',
      agenda: [
        'Review current farm layout',
        'Discuss soil test results',
        'Plan crop rotation strategy',
        'Set goals for next season'
      ],
      materials: ['Soil test report', 'Farm map', 'Crop calendar template'],
      notes: 'Farmer shows good understanding of sustainable practices. Recommended focus on legume integration for nitrogen fixation.',
      feedback: {
        mentee_rating: 5,
        mentee_comment: 'Excellent session! Sarah provided clear guidance and practical advice.',
        mentor_rating: 4,
        mentor_comment: 'Engaged mentee with good questions. Ready to implement recommendations.',
        goals_achieved: true,
        follow_up_needed: true,
        next_steps: [
          'Conduct soil amendments',
          'Source certified seeds',
          'Prepare planting schedule'
        ],
        submitted_at: '2024-03-15T11:30:00Z'
      },
      payment_status: 'paid',
      created_at: '2024-03-10T00:00:00Z'
    },
    {
      id: 'session_002',
      mentor_id: 'mentor_002',
      mentee_id: 'user_001',
      title: 'Dairy Cow Nutrition Assessment',
      description: 'Evaluate current feeding program and optimize for better milk production',
      scheduled_date: '2024-03-20T14:00:00Z',
      duration_minutes: 90,
      session_type: 'field_visit',
      status: 'scheduled',
      location: 'Mentee farm - GPS coordinates provided',
      agenda: [
        'Assess current feed quality',
        'Review feeding schedule',
        'Examine cow body condition',
        'Calculate feed requirements'
      ],
      materials: ['Feed samples', 'Body condition scoring chart', 'Feeding calculator'],
      payment_status: 'paid',
      created_at: '2024-03-18T00:00:00Z'
    }
  ];

  const getSamplePrograms = (): MentorshipProgram[] => [
    {
      id: 'program_001',
      name: 'Sustainable Farming Transition Program',
      description: 'Comprehensive 12-week program to help conventional farmers transition to sustainable practices',
      category: 'Sustainable Agriculture',
      target_audience: ['smallholder_farmers', 'transitioning_farmers'],
      duration_weeks: 12,
      mentor_requirements: {
        min_experience_years: 10,
        required_specializations: ['Sustainable Agriculture', 'Organic Farming'],
        min_rating: 4.5,
        verification_required: true
      },
      curriculum: [
        {
          id: 'module_001',
          title: 'Introduction to Sustainable Agriculture',
          description: 'Fundamentals of sustainable farming principles',
          week: 1,
          learning_objectives: [
            'Understand sustainable agriculture principles',
            'Identify current unsustainable practices',
            'Set transition goals'
          ],
          activities: ['Farm assessment', 'Goal setting workshop'],
          deliverables: ['Farm assessment report', 'Transition plan outline'],
          resources: ['Sustainable farming handbook', 'Assessment templates']
        },
        {
          id: 'module_002',
          title: 'Soil Health and Fertility Management',
          description: 'Building and maintaining healthy soils naturally',
          week: 2,
          learning_objectives: [
            'Assess soil health indicators',
            'Implement organic soil improvement',
            'Design composting systems'
          ],
          activities: ['Soil testing', 'Compost preparation'],
          deliverables: ['Soil improvement plan', 'Compost system design'],
          resources: ['Soil health guide', 'Composting manual']
        }
      ],
      incentive_structure: {
        base_commission: 30,
        performance_bonus: 10,
        completion_bonus: 50,
        revenue_share: 40
      },
      enrollment_criteria: {
        max_mentees_per_mentor: 8,
        application_required: true,
        prerequisites: ['Basic farming experience']
      },
      success_metrics: {
        completion_rate_target: 85,
        satisfaction_score_target: 4.5,
        knowledge_improvement_target: 70
      },
      created_by: 'Program Team',
      created_at: '2024-01-01T00:00:00Z',
      status: 'active'
    }
  ];

  const getSampleLeadFarmerPrograms = (): LeadFarmerProgram[] => [
    {
      id: 'lead_program_001',
      name: 'Maize Lead Farmer Initiative',
      description: 'Training and supporting lead farmers to improve maize production in their communities',
      region: 'Central Kenya',
      crop_focus: ['Maize', 'Beans'],
      selection_criteria: {
        min_farm_size: 2,
        min_experience_years: 5,
        min_yield_performance: 80,
        community_standing: true,
        technology_adoption: true
      },
      responsibilities: [
        'Train 20+ farmers per season',
        'Demonstrate new technologies',
        'Collect and report farmer data',
        'Facilitate input distribution',
        'Organize farmer field days'
      ],
      benefits: {
        monthly_stipend: 150,
        training_opportunities: ['Advanced agronomy', 'Leadership skills', 'Digital literacy'],
        equipment_access: ['Soil testing kit', 'Demonstration plots', 'Training materials'],
        market_access_support: true
      },
      performance_kpis: {
        farmers_trained: 20,
        adoption_rate: 70,
        yield_improvement: 25,
        knowledge_retention: 80
      },
      revenue_sharing: {
        input_sales_commission: 5,
        equipment_rental_commission: 10,
        training_fee_share: 20,
        referral_bonus: 25
      },
      support_structure: {
        regional_coordinator: 'Dr. Peter Kamau',
        technical_support: ['Agronomist visits', 'Phone support', 'WhatsApp group'],
        marketing_support: true
      },
      created_at: '2024-02-01T00:00:00Z',
      status: 'active'
    }
  ];

  const saveMentoringData = async () => {
    try {
      await offlineStorageService.storeOfflineData({
        id: 'mentors',
        type: 'marketplace' as any,
        data: mentors
      });
      
      await offlineStorageService.storeOfflineData({
        id: 'mentorship_sessions',
        type: 'marketplace' as any,
        data: sessions
      });
    } catch (error) {
      console.error('Failed to save mentoring data:', error);
    }
  };

  const bookSession = async (mentorId: string, packageId?: string) => {
    const mentor = mentors.find(m => m.id === mentorId);
    if (!mentor) return;

    const newSession: MentorshipSession = {
      id: `session_${Date.now()}`,
      mentor_id: mentorId,
      mentee_id: currentUserId,
      package_id: packageId,
      title: 'Consultation Session',
      description: 'General farming consultation and guidance',
      scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
      duration_minutes: 60,
      session_type: 'video_call',
      status: 'scheduled',
      agenda: ['Discuss farming challenges', 'Review current practices', 'Plan improvements'],
      materials: [],
      payment_status: 'pending',
      created_at: new Date().toISOString()
    };

    setSessions([...sessions, newSession]);
    await saveMentoringData();
    Alert.alert('Success', `Session booked with ${mentor.name}! You will receive confirmation details shortly.`);
    setShowBookingModal(false);
  };

  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '⭐'.repeat(fullStars) + (hasHalfStar ? '⭐' : '') + '☆'.repeat(emptyStars);
  };

  const getVerificationIcon = (verified: boolean) => {
    return verified ? '✅' : '⏳';
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#3B82F6';
      case 'in_progress': return '#F59E0B';
      case 'completed': return '#22C55E';
      case 'cancelled': return '#EF4444';
      case 'no_show': return '#9CA3AF';
      default: return '#6B7280';
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.specializations.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         mentor.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialization = filterSpecialization === 'all' || 
                                 mentor.specializations.includes(filterSpecialization);
    
    const matchesLocation = filterLocation === 'all' || 
                           mentor.location.toLowerCase().includes(filterLocation.toLowerCase());
    
    return matchesSearch && matchesSpecialization && matchesLocation && mentor.status === 'active';
  });

  const sortedMentors = [...filteredMentors].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating.average - a.rating.average;
      case 'experience':
        return b.experience_years - a.experience_years;
      case 'price':
        return a.pricing.hourly_rate - b.pricing.hourly_rate;
      case 'availability':
        return a.mentorship_stats.response_time_hours - b.mentorship_stats.response_time_hours;
      default:
        return 0;
    }
  });

  const specializations = [...new Set(mentors.flatMap(m => m.specializations))];
  const locations = [...new Set(mentors.map(m => m.location.split(',')[1]?.trim() || m.location))];

  const renderMentors = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search mentors..."
          placeholderTextColor="#9CA3AF"
        />
        
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
            <TouchableOpacity
              style={[styles.filter, filterSpecialization === 'all' && styles.filterActive]}
              onPress={() => setFilterSpecialization('all')}
            >
              <Text style={[styles.filterText, filterSpecialization === 'all' && styles.filterTextActive]}>
                All Specializations
              </Text>
            </TouchableOpacity>
            
            {specializations.slice(0, 5).map(spec => (
              <TouchableOpacity
                key={spec}
                style={[styles.filter, filterSpecialization === spec && styles.filterActive]}
                onPress={() => setFilterSpecialization(spec)}
              >
                <Text style={[styles.filterText, filterSpecialization === spec && styles.filterTextActive]}>
                  {spec}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
            <TouchableOpacity
              style={[styles.filter, sortBy === 'rating' && styles.filterActive]}
              onPress={() => setSortBy('rating')}
            >
              <Text style={[styles.filterText, sortBy === 'rating' && styles.filterTextActive]}>
                Top Rated
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filter, sortBy === 'experience' && styles.filterActive]}
              onPress={() => setSortBy('experience')}
            >
              <Text style={[styles.filterText, sortBy === 'experience' && styles.filterTextActive]}>
                Most Experienced
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filter, sortBy === 'price' && styles.filterActive]}
              onPress={() => setSortBy('price')}
            >
              <Text style={[styles.filterText, sortBy === 'price' && styles.filterTextActive]}>
                Best Price
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filter, sortBy === 'availability' && styles.filterActive]}
              onPress={() => setSortBy('availability')}
            >
              <Text style={[styles.filterText, sortBy === 'availability' && styles.filterTextActive]}>
                Quick Response
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {sortedMentors.map(mentor => (
        <View key={mentor.id} style={styles.mentorCard}>
          <View style={styles.mentorHeader}>
            <View style={styles.mentorInfo}>
              <View style={styles.mentorNameRow}>
                <Text style={styles.mentorName}>{mentor.name}</Text>
                <Text style={styles.verificationIcon}>
                  {getVerificationIcon(mentor.verification.verified)}
                </Text>
              </View>
              <Text style={styles.mentorLocation}>📍 {mentor.location}</Text>
              <Text style={styles.mentorExperience}>
                {mentor.experience_years} years experience • {mentor.farm_size_hectares} hectares
              </Text>
            </View>
            
            <View style={styles.mentorRating}>
              <Text style={styles.ratingStars}>{getRatingStars(mentor.rating.average)}</Text>
              <Text style={styles.ratingText}>
                {mentor.rating.average.toFixed(1)} ({mentor.rating.count})
              </Text>
              <Text style={styles.priceText}>
                ${mentor.pricing.hourly_rate}/hour
              </Text>
            </View>
          </View>

          <Text style={styles.mentorBio} numberOfLines={3}>{mentor.bio}</Text>

          <View style={styles.specializationsContainer}>
            <Text style={styles.specializationsTitle}>Specializations</Text>
            <View style={styles.specializationsList}>
              {mentor.specializations.slice(0, 3).map(spec => (
                <View key={spec} style={styles.specializationBadge}>
                  <Text style={styles.specializationText}>{spec}</Text>
                </View>
              ))}
              {mentor.specializations.length > 3 && (
                <Text style={styles.moreSpecializations}>
                  +{mentor.specializations.length - 3} more
                </Text>
              )}
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mentor.mentorship_stats.total_mentees}</Text>
              <Text style={styles.statLabel}>Mentees</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mentor.mentorship_stats.success_rate}%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mentor.mentorship_stats.response_time_hours}h</Text>
              <Text style={styles.statLabel}>Response Time</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mentor.mentorship_stats.active_mentees}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>

          <View style={styles.performanceMetrics}>
            <Text style={styles.metricsTitle}>Performance Scores</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Knowledge</Text>
                <Text style={styles.metricValue}>{mentor.performance_metrics.knowledge_score}%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Communication</Text>
                <Text style={styles.metricValue}>{mentor.performance_metrics.communication_score}%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Reliability</Text>
                <Text style={styles.metricValue}>{mentor.performance_metrics.reliability_score}%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Impact</Text>
                <Text style={styles.metricValue}>{mentor.performance_metrics.impact_score}%</Text>
              </View>
            </View>
          </View>

          {mentor.pricing.packages.length > 0 && (
            <View style={styles.packagesContainer}>
              <Text style={styles.packagesTitle}>Mentorship Packages</Text>
              {mentor.pricing.packages.slice(0, 2).map(pkg => (
                <View key={pkg.id} style={[styles.packageCard, pkg.popular && styles.popularPackage]}>
                  <View style={styles.packageHeader}>
                    <Text style={styles.packageName}>{pkg.name}</Text>
                    {pkg.popular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularBadgeText}>POPULAR</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.packageDescription}>{pkg.description}</Text>
                  <View style={styles.packageDetails}>
                    <Text style={styles.packageDuration}>
                      {pkg.duration_weeks} weeks • {pkg.sessions_included} sessions
                    </Text>
                    <Text style={styles.packagePrice}>
                      ${pkg.price} {pkg.currency}
                    </Text>
                  </View>
                  <View style={styles.packageFeatures}>
                    {pkg.features.slice(0, 3).map(feature => (
                      <Text key={feature} style={styles.packageFeature}>
                        ✓ {feature}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.mentorActions}>
            <TouchableOpacity
              style={styles.viewProfileButton}
              onPress={() => {
                setSelectedMentor(mentor);
                setShowMentorModal(true);
              }}
            >
              <Text style={styles.viewProfileButtonText}>View Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.bookSessionButton}
              onPress={() => {
                setSelectedMentor(mentor);
                setShowBookingModal(true);
              }}
            >
              <Text style={styles.bookSessionButtonText}>Book Session</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.messageButton}>
              <Text style={styles.messageButtonText}>💬</Text>
            </TouchableOpacity>
          </View>

          {mentor.achievements.length > 0 && (
            <View style={styles.achievementsContainer}>
              <Text style={styles.achievementsTitle}>Key Achievements</Text>
              {mentor.achievements.slice(0, 2).map((achievement, index) => (
                <Text key={index} style={styles.achievement}>
                  🏆 {achievement}
                </Text>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderSessions = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Your Mentorship Sessions</Text>
      
      <View style={styles.sessionsSummary}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {sessions.filter(s => s.mentee_id === currentUserId && s.status === 'scheduled').length}
          </Text>
          <Text style={styles.summaryLabel}>Scheduled</Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {sessions.filter(s => s.mentee_id === currentUserId && s.status === 'completed').length}
          </Text>
          <Text style={styles.summaryLabel}>Completed</Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {sessions.filter(s => s.mentee_id === currentUserId && s.status === 'in_progress').length}
          </Text>
          <Text style={styles.summaryLabel}>In Progress</Text>
        </View>
      </View>

      {sessions.filter(s => s.mentee_id === currentUserId).map(session => {
        const mentor = mentors.find(m => m.id === session.mentor_id);
        if (!mentor) return null;
        
        return (
          <View key={session.id} style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitle}>{session.title}</Text>
                <Text style={styles.sessionMentor}>with {mentor.name}</Text>
                <Text style={styles.sessionDate}>
                  {new Date(session.scheduled_date).toLocaleDateString()} at{' '}
                  {new Date(session.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              
              <View style={[styles.sessionStatus, { backgroundColor: getSessionStatusColor(session.status) }]}>
                <Text style={styles.sessionStatusText}>
                  {session.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.sessionDescription}>{session.description}</Text>

            <View style={styles.sessionDetails}>
              <Text style={styles.sessionDetail}>
                Duration: {session.duration_minutes} minutes
              </Text>
              <Text style={styles.sessionDetail}>
                Type: {session.session_type.replace('_', ' ')}
              </Text>
              <Text style={styles.sessionDetail}>
                Payment: {session.payment_status}
              </Text>
            </View>

            {session.agenda.length > 0 && (
              <View style={styles.agendaContainer}>
                <Text style={styles.agendaTitle}>Agenda</Text>
                {session.agenda.map((item, index) => (
                  <Text key={index} style={styles.agendaItem}>
                    • {item}
                  </Text>
                ))}
              </View>
            )}

            {session.feedback && (
              <View style={styles.feedbackContainer}>
                <Text style={styles.feedbackTitle}>Session Feedback</Text>
                <View style={styles.feedbackRating}>
                  <Text style={styles.feedbackRatingText}>
                    Your Rating: {getRatingStars(session.feedback.mentee_rating)}
                  </Text>
                </View>
                <Text style={styles.feedbackComment}>"{session.feedback.mentee_comment}"</Text>
                
                {session.feedback.next_steps.length > 0 && (
                  <View style={styles.nextStepsContainer}>
                    <Text style={styles.nextStepsTitle}>Next Steps</Text>
                    {session.feedback.next_steps.map((step, index) => (
                      <Text key={index} style={styles.nextStep}>
                        {index + 1}. {step}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View style={styles.sessionActions}>
              {session.status === 'scheduled' && (
                <>
                  <TouchableOpacity style={styles.joinButton}>
                    <Text style={styles.joinButtonText}>Join Session</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.rescheduleButton}>
                    <Text style={styles.rescheduleButtonText}>Reschedule</Text>
                  </TouchableOpacity>
                </>
              )}
              
              {session.status === 'completed' && !session.feedback && (
                <TouchableOpacity style={styles.feedbackButton}>
                  <Text style={styles.feedbackButtonText}>Leave Feedback</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.detailsButton}>
                <Text style={styles.detailsButtonText}>Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
      
      {sessions.filter(s => s.mentee_id === currentUserId).length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            📚 No mentorship sessions yet. Book your first session with a mentor!
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderPrograms = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Mentorship Programs</Text>
      
      {programs.filter(p => p.status === 'active').map(program => (
        <View key={program.id} style={styles.programCard}>
          <View style={styles.programHeader}>
            <Text style={styles.programName}>{program.name}</Text>
            <View style={styles.programCategory}>
              <Text style={styles.programCategoryText}>{program.category}</Text>
            </View>
          </View>
          
          <Text style={styles.programDescription}>{program.description}</Text>
          
          <View style={styles.programDetails}>
            <View style={styles.programDetail}>
              <Text style={styles.programDetailLabel}>Duration</Text>
              <Text style={styles.programDetailValue}>{program.duration_weeks} weeks</Text>
            </View>
            
            <View style={styles.programDetail}>
              <Text style={styles.programDetailLabel}>Target</Text>
              <Text style={styles.programDetailValue}>
                {program.target_audience.join(', ').replace('_', ' ')}
              </Text>
            </View>
            
            <View style={styles.programDetail}>
              <Text style={styles.programDetailLabel}>Max Mentees</Text>
              <Text style={styles.programDetailValue}>
                {program.enrollment_criteria.max_mentees_per_mentor}
              </Text>
            </View>
          </View>
          
          <View style={styles.curriculumPreview}>
            <Text style={styles.curriculumTitle}>Curriculum Preview</Text>
            {program.curriculum.slice(0, 3).map(module => (
              <View key={module.id} style={styles.curriculumModule}>
                <Text style={styles.moduleTitle}>
                  Week {module.week}: {module.title}
                </Text>
                <Text style={styles.moduleDescription}>{module.description}</Text>
              </View>
            ))}
            {program.curriculum.length > 3 && (
              <Text style={styles.moreCurriculum}>
                +{program.curriculum.length - 3} more modules
              </Text>
            )}
          </View>
          
          <View style={styles.programMetrics}>
            <Text style={styles.metricsTitle}>Success Targets</Text>
            <View style={styles.metricsRow}>
              <Text style={styles.metricText}>
                Completion: {program.success_metrics.completion_rate_target}%
              </Text>
              <Text style={styles.metricText}>
                Satisfaction: {program.success_metrics.satisfaction_score_target}/5
              </Text>
            </View>
          </View>
          
          <View style={styles.programActions}>
            <TouchableOpacity style={styles.enrollButton}>
              <Text style={styles.enrollButtonText}>Enroll as Mentee</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.mentorApplyButton}>
              <Text style={styles.mentorApplyButtonText}>Apply as Mentor</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderLeadFarmers = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Lead Farmer Programs</Text>
      
      {leadFarmerPrograms.filter(p => p.status === 'active').map(program => (
        <View key={program.id} style={styles.leadFarmerCard}>
          <View style={styles.leadFarmerHeader}>
            <Text style={styles.leadFarmerName}>{program.name}</Text>
            <View style={styles.regionBadge}>
              <Text style={styles.regionBadgeText}>{program.region}</Text>
            </View>
          </View>
          
          <Text style={styles.leadFarmerDescription}>{program.description}</Text>
          
          <View style={styles.cropFocusContainer}>
            <Text style={styles.cropFocusTitle}>Crop Focus</Text>
            <View style={styles.cropFocusList}>
              {program.crop_focus.map(crop => (
                <View key={crop} style={styles.cropBadge}>
                  <Text style={styles.cropText}>{crop}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.selectionCriteria}>
            <Text style={styles.criteriaTitle}>Selection Criteria</Text>
            <Text style={styles.criteriaItem}>
              • Minimum {program.selection_criteria.min_farm_size} hectares
            </Text>
            <Text style={styles.criteriaItem}>
              • {program.selection_criteria.min_experience_years}+ years experience
            </Text>
            <Text style={styles.criteriaItem}>
              • {program.selection_criteria.min_yield_performance}%+ yield performance
            </Text>
            <Text style={styles.criteriaItem}>
              • Strong community standing
            </Text>
            <Text style={styles.criteriaItem}>
              • Technology adoption mindset
            </Text>
          </View>
          
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Benefits & Compensation</Text>
            <Text style={styles.benefitItem}>
              💰 ${program.benefits.monthly_stipend}/month stipend
            </Text>
            <Text style={styles.benefitItem}>
              📚 Training: {program.benefits.training_opportunities.join(', ')}
            </Text>
            <Text style={styles.benefitItem}>
              🛠️ Equipment: {program.benefits.equipment_access.join(', ')}
            </Text>
            {program.benefits.market_access_support && (
              <Text style={styles.benefitItem}>
                🏪 Market access support included
              </Text>
            )}
          </View>
          
          <View style={styles.kpisContainer}>
            <Text style={styles.kpisTitle}>Performance KPIs</Text>
            <View style={styles.kpisGrid}>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiValue}>{program.performance_kpis.farmers_trained}</Text>
                <Text style={styles.kpiLabel}>Farmers Trained</Text>
              </View>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiValue}>{program.performance_kpis.adoption_rate}%</Text>
                <Text style={styles.kpiLabel}>Adoption Rate</Text>
              </View>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiValue}>{program.performance_kpis.yield_improvement}%</Text>
                <Text style={styles.kpiLabel}>Yield Improvement</Text>
              </View>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiValue}>{program.performance_kpis.knowledge_retention}%</Text>
                <Text style={styles.kpiLabel}>Knowledge Retention</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.revenueSharing}>
            <Text style={styles.revenueSharingTitle}>Revenue Sharing Opportunities</Text>
            <Text style={styles.revenueItem}>
              🛒 Input sales: {program.revenue_sharing.input_sales_commission}% commission
            </Text>
            <Text style={styles.revenueItem}>
              🚜 Equipment rental: {program.revenue_sharing.equipment_rental_commission}% commission
            </Text>
            <Text style={styles.revenueItem}>
              📖 Training fees: {program.revenue_sharing.training_fee_share}% share
            </Text>
            <Text style={styles.revenueItem}>
              👥 Referral bonus: ${program.revenue_sharing.referral_bonus} per farmer
            </Text>
          </View>
          
          <View style={styles.leadFarmerActions}>
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Apply to Program</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.learnMoreButton}>
              <Text style={styles.learnMoreButtonText}>Learn More</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderMentorModal = () => (
    <Modal
      visible={showMentorModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowMentorModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Mentor Profile</Text>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowMentorModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {selectedMentor && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.mentorProfileHeader}>
              <Text style={styles.mentorProfileName}>{selectedMentor.name}</Text>
              <Text style={styles.mentorProfileLocation}>📍 {selectedMentor.location}</Text>
              <Text style={styles.mentorProfileRating}>
                {getRatingStars(selectedMentor.rating.average)} {selectedMentor.rating.average.toFixed(1)} ({selectedMentor.rating.count} reviews)
              </Text>
            </View>

            <View style={styles.mentorProfileBio}>
              <Text style={styles.mentorProfileBioText}>{selectedMentor.bio}</Text>
            </View>

            <View style={styles.mentorProfileDetails}>
              <Text style={styles.profileSectionTitle}>Experience & Expertise</Text>
              <Text style={styles.profileDetail}>
                Experience: {selectedMentor.experience_years} years
              </Text>
              <Text style={styles.profileDetail}>
                Farm Size: {selectedMentor.farm_size_hectares} hectares
              </Text>
              <Text style={styles.profileDetail}>
                Crops: {selectedMentor.crops_grown.join(', ')}
              </Text>
              {selectedMentor.livestock_types.length > 0 && (
                <Text style={styles.profileDetail}>
                  Livestock: {selectedMentor.livestock_types.join(', ')}
                </Text>
              )}
            </View>

            <View style={styles.certificationsSection}>
              <Text style={styles.profileSectionTitle}>Certifications</Text>
              {selectedMentor.certifications.map(cert => (
                <Text key={cert} style={styles.certificationItem}>
                  🏆 {cert}
                </Text>
              ))}
            </View>

            <View style={styles.achievementsSection}>
              <Text style={styles.profileSectionTitle}>Key Achievements</Text>
              {selectedMentor.achievements.map((achievement, index) => (
                <Text key={index} style={styles.achievementItem}>
                  ⭐ {achievement}
                </Text>
              ))}
            </View>

            <View style={styles.availabilitySection}>
              <Text style={styles.profileSectionTitle}>Availability</Text>
              <Text style={styles.availabilityText}>
                Days: {selectedMentor.availability.days.join(', ')}
              </Text>
              <Text style={styles.availabilityText}>
                Hours: {selectedMentor.availability.hours.start} - {selectedMentor.availability.hours.end} ({selectedMentor.availability.timezone})
              </Text>
              <Text style={styles.availabilityText}>
                Average Response Time: {selectedMentor.mentorship_stats.response_time_hours} hours
              </Text>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  const renderBookingModal = () => (
    <Modal
      visible={showBookingModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowBookingModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Book Session</Text>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowBookingModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {selectedMentor && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.bookingMentorInfo}>
              <Text style={styles.bookingMentorName}>{selectedMentor.name}</Text>
              <Text style={styles.bookingMentorRate}>
                ${selectedMentor.pricing.hourly_rate}/hour
              </Text>
            </View>

            <View style={styles.bookingOptions}>
              <Text style={styles.bookingOptionsTitle}>Booking Options</Text>
              
              <TouchableOpacity
                style={styles.bookingOption}
                onPress={() => bookSession(selectedMentor.id)}
              >
                <Text style={styles.bookingOptionTitle}>Single Session</Text>
                <Text style={styles.bookingOptionDescription}>
                  One-time consultation session
                </Text>
                <Text style={styles.bookingOptionPrice}>
                  ${selectedMentor.pricing.hourly_rate}
                </Text>
              </TouchableOpacity>

              {selectedMentor.pricing.packages.map(pkg => (
                <TouchableOpacity
                  key={pkg.id}
                  style={[styles.bookingOption, pkg.popular && styles.popularBookingOption]}
                  onPress={() => bookSession(selectedMentor.id, pkg.id)}
                >
                  <View style={styles.bookingOptionHeader}>
                    <Text style={styles.bookingOptionTitle}>{pkg.name}</Text>
                    {pkg.popular && (
                      <View style={styles.popularLabel}>
                        <Text style={styles.popularLabelText}>POPULAR</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.bookingOptionDescription}>
                    {pkg.description}
                  </Text>
                  <Text style={styles.bookingOptionDetails}>
                    {pkg.duration_weeks} weeks • {pkg.sessions_included} sessions
                  </Text>
                  <Text style={styles.bookingOptionPrice}>
                    ${pkg.price} {pkg.currency}
                  </Text>
                  <View style={styles.packageFeaturesList}>
                    {pkg.features.slice(0, 3).map(feature => (
                      <Text key={feature} style={styles.packageFeatureItem}>
                        ✓ {feature}
                      </Text>
                    ))}
                  </View>
                </TouchableOpacity>
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
        <Text style={styles.title}>Peer Mentoring System</Text>
        <Text style={styles.subtitle}>Connect with experienced farmers & lead mentors</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'mentors' && styles.activeTab]}
          onPress={() => setActiveTab('mentors')}
        >
          <Text style={[styles.tabText, activeTab === 'mentors' && styles.activeTabText]}>
            Mentors ({sortedMentors.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sessions' && styles.activeTab]}
          onPress={() => setActiveTab('sessions')}
        >
          <Text style={[styles.tabText, activeTab === 'sessions' && styles.activeTabText]}>
            Sessions
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'programs' && styles.activeTab]}
          onPress={() => setActiveTab('programs')}
        >
          <Text style={[styles.tabText, activeTab === 'programs' && styles.activeTabText]}>
            Programs
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'lead_farmers' && styles.activeTab]}
          onPress={() => setActiveTab('lead_farmers')}
        >
          <Text style={[styles.tabText, activeTab === 'lead_farmers' && styles.activeTabText]}>
            Lead Farmers
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'mentors' && renderMentors()}
      {activeTab === 'sessions' && renderSessions()}
      {activeTab === 'programs' && renderPrograms()}
      {activeTab === 'lead_farmers' && renderLeadFarmers()}

      {renderMentorModal()}
      {renderBookingModal()}
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
    fontSize: 14,
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
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  mentorCard: {
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
  mentorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mentorInfo: {
    flex: 1,
  },
  mentorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  mentorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 8,
  },
  verificationIcon: {
    fontSize: 16,
  },
  mentorLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  mentorExperience: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  mentorRating: {
    alignItems: 'flex-end',
  },
  ratingStars: {
    fontSize: 14,
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#228B22',
  },
  mentorBio: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  specializationsContainer: {
    marginBottom: 16,
  },
  specializationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  specializationsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specializationBadge: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  specializationText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '600',
  },
  moreSpecializations: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    alignSelf: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#228B22',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  performanceMetrics: {
    marginBottom: 16,
  },
  metricsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  packagesContainer: {
    marginBottom: 16,
  },
  packagesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  packageCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  popularPackage: {
    borderColor: '#F59E0B',
    borderWidth: 2,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  packageName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  popularBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  popularBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  packageDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  packageDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  packagePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#228B22',
  },
  packageFeatures: {
    marginTop: 4,
  },
  packageFeature: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  mentorActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  viewProfileButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 4,
  },
  viewProfileButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  bookSessionButton: {
    backgroundColor: '#228B22',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
  },
  bookSessionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  messageButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 4,
  },
  messageButtonText: {
    fontSize: 16,
  },
  achievementsContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
  },
  achievementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  achievement: {
    fontSize: 12,
    color: '#92400E',
    marginBottom: 4,
  },
  sessionsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#228B22',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  sessionCard: {
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
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  sessionMentor: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sessionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sessionStatusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sessionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  sessionDetail: {
    fontSize: 12,
    color: '#6B7280',
  },
  agendaContainer: {
    marginBottom: 12,
  },
  agendaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  agendaItem: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  feedbackContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  feedbackRating: {
    marginBottom: 8,
  },
  feedbackRatingText: {
    fontSize: 12,
    color: '#6B7280',
  },
  feedbackComment: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  nextStepsContainer: {
    marginTop: 8,
  },
  nextStepsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  nextStep: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  sessionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  joinButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 4,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  rescheduleButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
  },
  rescheduleButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  feedbackButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 4,
  },
  feedbackButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  detailsButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginLeft: 4,
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  programCard: {
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
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  programName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  programCategory: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  programCategoryText: {
    fontSize: 10,
    color: '#1E40AF',
    fontWeight: '600',
  },
  programDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 16,
  },
  programDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  programDetail: {
    alignItems: 'center',
    flex: 1,
  },
  programDetailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  programDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  curriculumPreview: {
    marginBottom: 16,
  },
  curriculumTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  curriculumModule: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  moduleTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 11,
    color: '#6B7280',
  },
  moreCurriculum: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  programMetrics: {
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricText: {
    fontSize: 12,
    color: '#6B7280',
  },
  programActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  enrollButton: {
    backgroundColor: '#228B22',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  enrollButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  mentorApplyButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    flex: 1,
    marginLeft: 8,
  },
  mentorApplyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  leadFarmerCard: {
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
    borderLeftColor: '#F59E0B',
  },
  leadFarmerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leadFarmerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  regionBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  regionBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  leadFarmerDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 16,
  },
  cropFocusContainer: {
    marginBottom: 16,
  },
  cropFocusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  cropFocusList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cropBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  cropText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  selectionCriteria: {
    marginBottom: 16,
  },
  criteriaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  criteriaItem: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  benefitsContainer: {
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  benefitItem: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  kpisContainer: {
    marginBottom: 16,
  },
  kpisTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  kpisGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kpiItem: {
    alignItems: 'center',
    flex: 1,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  revenueSharing: {
    marginBottom: 16,
  },
  revenueSharingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  revenueItem: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  leadFarmerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  applyButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  learnMoreButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    flex: 1,
    marginLeft: 8,
  },
  learnMoreButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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
  mentorProfileHeader: {
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
  mentorProfileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  mentorProfileLocation: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  mentorProfileRating: {
    fontSize: 14,
    color: '#374151',
  },
  mentorProfileBio: {
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
  mentorProfileBioText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  mentorProfileDetails: {
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
  profileSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  profileDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
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
  certificationItem: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  achievementsSection: {
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
  achievementItem: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  availabilitySection: {
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
  availabilityText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  bookingMentorInfo: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  bookingMentorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  bookingMentorRate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#228B22',
  },
  bookingOptions: {
    marginBottom: 32,
  },
  bookingOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  bookingOption: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  popularBookingOption: {
    borderColor: '#F59E0B',
    borderWidth: 2,
  },
  bookingOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  popularLabel: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  popularLabelText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  bookingOptionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  bookingOptionDetails: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  bookingOptionPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#228B22',
    marginBottom: 12,
  },
  packageFeaturesList: {
    marginTop: 8,
  },
  packageFeatureItem: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
});

export default PeerMentoringSystem;
