import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Modal, Image } from 'react-native';
import { offlineStorageService } from '../services/OfflineStorageService';

interface ForumTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  created_by: string;
  created_by_name: string;
  created_by_avatar?: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'closed' | 'pinned' | 'archived';
  tags: string[];
  post_count: number;
  view_count: number;
  last_activity: {
    user_id: string;
    user_name: string;
    timestamp: string;
    action: 'post' | 'reply' | 'like' | 'share';
  };
  moderation: {
    is_moderated: boolean;
    moderator_id?: string;
    moderation_notes?: string;
  };
  engagement_stats: {
    likes: number;
    shares: number;
    bookmarks: number;
    expert_responses: number;
  };
}

interface ForumPost {
  id: string;
  topic_id: string;
  content: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_role: 'farmer' | 'expert' | 'moderator' | 'lead_farmer' | 'admin';
  created_at: string;
  updated_at?: string;
  is_edited: boolean;
  parent_post_id?: string;
  attachments: PostAttachment[];
  reactions: {
    [emoji: string]: {
      count: number;
      users: string[];
    };
  };
  is_solution: boolean;
  is_expert_verified: boolean;
  moderation_status: 'approved' | 'pending' | 'flagged' | 'removed';
  engagement: {
    likes: number;
    replies: number;
    shares: number;
  };
}

interface PostAttachment {
  id: string;
  type: 'image' | 'video' | 'document' | 'audio';
  url: string;
  filename: string;
  size_bytes: number;
  thumbnail_url?: string;
  description?: string;
}

interface ChatConversation {
  id: string;
  type: 'direct' | 'group' | 'expert_consultation';
  participants: ChatParticipant[];
  title?: string;
  description?: string;
  created_by: string;
  created_at: string;
  last_message: {
    id: string;
    content: string;
    sender_id: string;
    sender_name: string;
    timestamp: string;
    type: 'text' | 'image' | 'voice' | 'location' | 'file' | 'system';
  };
  unread_count: number;
  is_archived: boolean;
  is_muted: boolean;
  settings: {
    allow_media: boolean;
    allow_voice: boolean;
    auto_translate: boolean;
    language_preference: string;
  };
}

interface ChatParticipant {
  user_id: string;
  name: string;
  avatar?: string;
  role: 'farmer' | 'expert' | 'moderator' | 'lead_farmer';
  status: 'online' | 'offline' | 'away';
  last_seen: string;
  permissions: {
    can_add_members: boolean;
    can_remove_members: boolean;
    can_edit_settings: boolean;
  };
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  timestamp: string;
  type: 'text' | 'image' | 'voice' | 'location' | 'file' | 'system';
  attachments: MessageAttachment[];
  reply_to?: {
    message_id: string;
    content_preview: string;
    sender_name: string;
  };
  reactions: {
    [emoji: string]: string[];
  };
  is_edited: boolean;
  is_deleted: boolean;
  delivery_status: 'sent' | 'delivered' | 'read';
  translation?: {
    original_language: string;
    translated_content: string;
    target_language: string;
  };
}

interface MessageAttachment {
  id: string;
  type: 'image' | 'voice' | 'location' | 'file';
  url: string;
  filename?: string;
  size_bytes?: number;
  duration_seconds?: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  thumbnail_url?: string;
}

interface QAQuestion {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  asked_by: string;
  asked_by_name: string;
  asked_by_avatar?: string;
  asked_at: string;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  crop_type?: string;
  location?: string;
  farm_size?: number;
  attachments: PostAttachment[];
  status: 'open' | 'answered' | 'closed' | 'escalated';
  bounty?: {
    amount: number;
    currency: string;
    sponsored_by?: string;
  };
  engagement_stats: {
    views: number;
    upvotes: number;
    downvotes: number;
    bookmarks: number;
    shares: number;
  };
}

interface QAAnswer {
  id: string;
  question_id: string;
  content: string;
  answered_by: string;
  answered_by_name: string;
  answered_by_avatar?: string;
  answered_by_role: 'farmer' | 'expert' | 'moderator' | 'lead_farmer';
  answered_at: string;
  is_accepted: boolean;
  is_expert_verified: boolean;
  confidence_score: number;
  attachments: PostAttachment[];
  upvotes: number;
  downvotes: number;
  comments: QAComment[];
  verification: {
    verified_by?: string;
    verified_at?: string;
    verification_notes?: string;
  };
}

interface QAComment {
  id: string;
  content: string;
  author_id: string;
  author_name: string;
  created_at: string;
  is_expert: boolean;
}

export const CommunityHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'forums' | 'chat' | 'qa' | 'events'>('forums');
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [qaQuestions, setQAQuestions] = useState<QAQuestion[]>([]);
  const [qaAnswers, setQAAnswers] = useState<QAAnswer[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<QAQuestion | null>(null);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending' | 'unanswered'>('recent');
  const [newPostContent, setNewPostContent] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [currentUserId] = useState('user_001'); // Current user context

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      const topicsData = await offlineStorageService.getOfflineDataByType('forum_topics');
      const postsData = await offlineStorageService.getOfflineDataByType('forum_posts');
      const conversationsData = await offlineStorageService.getOfflineDataByType('chat_conversations');
      const messagesData = await offlineStorageService.getOfflineDataByType('chat_messages');
      const questionsData = await offlineStorageService.getOfflineDataByType('qa_questions');
      const answersData = await offlineStorageService.getOfflineDataByType('qa_answers');
      
      if (topicsData.length > 0) {
        setForumTopics(topicsData[0].data);
      } else {
        setForumTopics(getSampleForumTopics());
      }
      
      if (postsData.length > 0) {
        setForumPosts(postsData[0].data);
      } else {
        setForumPosts(getSampleForumPosts());
      }
      
      if (conversationsData.length > 0) {
        setConversations(conversationsData[0].data);
      } else {
        setConversations(getSampleConversations());
      }
      
      if (messagesData.length > 0) {
        setMessages(messagesData[0].data);
      } else {
        setMessages(getSampleMessages());
      }
      
      if (questionsData.length > 0) {
        setQAQuestions(questionsData[0].data);
      } else {
        setQAQuestions(getSampleQuestions());
      }
      
      if (answersData.length > 0) {
        setQAAnswers(answersData[0].data);
      } else {
        setQAAnswers(getSampleAnswers());
      }
    } catch (error) {
      console.error('Failed to load community data:', error);
    }
  };

  const getSampleForumTopics = (): ForumTopic[] => [
    {
      id: 'topic_001',
      title: 'Best practices for maize farming in drought conditions',
      description: 'Looking for advice on how to maintain good maize yields during dry seasons. What varieties work best?',
      category: 'Crop Management',
      created_by: 'user_farmer_001',
      created_by_name: 'John Mwangi',
      created_by_avatar: 'john_avatar.jpg',
      created_at: '2024-03-01T10:00:00Z',
      updated_at: '2024-03-15T14:30:00Z',
      status: 'active',
      tags: ['maize', 'drought', 'varieties', 'yield'],
      post_count: 23,
      view_count: 156,
      last_activity: {
        user_id: 'expert_001',
        user_name: 'Dr. Sarah Kimani',
        timestamp: '2024-03-15T14:30:00Z',
        action: 'reply'
      },
      moderation: {
        is_moderated: false
      },
      engagement_stats: {
        likes: 45,
        shares: 12,
        bookmarks: 28,
        expert_responses: 3
      }
    },
    {
      id: 'topic_002',
      title: 'Organic pest control methods that actually work',
      description: 'Share your experiences with natural pest control. What has worked for you?',
      category: 'Pest Control',
      created_by: 'user_farmer_002',
      created_by_name: 'Grace Wanjiku',
      created_by_avatar: 'grace_avatar.jpg',
      created_at: '2024-03-05T08:15:00Z',
      updated_at: '2024-03-20T16:45:00Z',
      status: 'pinned',
      tags: ['organic', 'pest control', 'natural', 'IPM'],
      post_count: 67,
      view_count: 289,
      last_activity: {
        user_id: 'user_farmer_015',
        user_name: 'Peter Ochieng',
        timestamp: '2024-03-20T16:45:00Z',
        action: 'post'
      },
      moderation: {
        is_moderated: true,
        moderator_id: 'mod_001',
        moderation_notes: 'High-quality discussion, pinned for visibility'
      },
      engagement_stats: {
        likes: 89,
        shares: 34,
        bookmarks: 56,
        expert_responses: 7
      }
    },
    {
      id: 'topic_003',
      title: 'Market prices for tomatoes - weekly updates',
      description: 'Let\'s share current market prices for tomatoes across different regions',
      category: 'Market Information',
      created_by: 'user_trader_001',
      created_by_name: 'Mary Njeri',
      created_by_avatar: 'mary_avatar.jpg',
      created_at: '2024-03-10T12:00:00Z',
      updated_at: '2024-03-22T09:30:00Z',
      status: 'active',
      tags: ['tomatoes', 'prices', 'market', 'trading'],
      post_count: 34,
      view_count: 198,
      last_activity: {
        user_id: 'user_farmer_008',
        user_name: 'David Kiprotich',
        timestamp: '2024-03-22T09:30:00Z',
        action: 'post'
      },
      moderation: {
        is_moderated: false
      },
      engagement_stats: {
        likes: 23,
        shares: 18,
        bookmarks: 41,
        expert_responses: 1
      }
    }
  ];

  const getSampleForumPosts = (): ForumPost[] => [
    {
      id: 'post_001',
      topic_id: 'topic_001',
      content: 'I\'ve had great success with drought-resistant varieties like DH04 and KH500-19A. The key is early planting and proper spacing to maximize water use efficiency.',
      author_id: 'expert_001',
      author_name: 'Dr. Sarah Kimani',
      author_avatar: 'sarah_avatar.jpg',
      author_role: 'expert',
      created_at: '2024-03-15T14:30:00Z',
      is_edited: false,
      attachments: [
        {
          id: 'att_001',
          type: 'image',
          url: 'drought_resistant_maize.jpg',
          filename: 'drought_resistant_varieties.jpg',
          size_bytes: 245760,
          thumbnail_url: 'drought_resistant_maize_thumb.jpg',
          description: 'Comparison of drought-resistant maize varieties'
        }
      ],
      reactions: {
        '👍': { count: 12, users: ['user_001', 'user_002'] },
        '❤️': { count: 5, users: ['user_003'] },
        '💡': { count: 8, users: ['user_004', 'user_005'] }
      },
      is_solution: true,
      is_expert_verified: true,
      moderation_status: 'approved',
      engagement: {
        likes: 25,
        replies: 8,
        shares: 6
      }
    },
    {
      id: 'post_002',
      topic_id: 'topic_001',
      content: 'Thanks Dr. Kimani! I tried DH04 last season and got 4.5 tons per hectare even with limited rainfall. Highly recommend it.',
      author_id: 'user_farmer_003',
      author_name: 'James Mutua',
      author_avatar: 'james_avatar.jpg',
      author_role: 'farmer',
      created_at: '2024-03-15T15:45:00Z',
      is_edited: false,
      parent_post_id: 'post_001',
      attachments: [],
      reactions: {
        '👍': { count: 8, users: ['user_001', 'expert_001'] },
        '🌽': { count: 3, users: ['user_002'] }
      },
      is_solution: false,
      is_expert_verified: false,
      moderation_status: 'approved',
      engagement: {
        likes: 11,
        replies: 2,
        shares: 1
      }
    }
  ];

  const getSampleConversations = (): ChatConversation[] => [
    {
      id: 'conv_001',
      type: 'group',
      participants: [
        {
          user_id: 'user_001',
          name: 'John Mwangi',
          avatar: 'john_avatar.jpg',
          role: 'farmer',
          status: 'online',
          last_seen: '2024-03-22T10:00:00Z',
          permissions: {
            can_add_members: true,
            can_remove_members: false,
            can_edit_settings: false
          }
        },
        {
          user_id: 'user_002',
          name: 'Grace Wanjiku',
          avatar: 'grace_avatar.jpg',
          role: 'farmer',
          status: 'offline',
          last_seen: '2024-03-22T08:30:00Z',
          permissions: {
            can_add_members: false,
            can_remove_members: false,
            can_edit_settings: false
          }
        },
        {
          user_id: 'expert_001',
          name: 'Dr. Sarah Kimani',
          avatar: 'sarah_avatar.jpg',
          role: 'expert',
          status: 'away',
          last_seen: '2024-03-22T09:15:00Z',
          permissions: {
            can_add_members: true,
            can_remove_members: true,
            can_edit_settings: true
          }
        }
      ],
      title: 'Nakuru Farmers Group',
      description: 'Discussion group for farmers in Nakuru region',
      created_by: 'user_001',
      created_at: '2024-03-01T00:00:00Z',
      last_message: {
        id: 'msg_latest_001',
        content: 'The weather forecast shows rain next week. Good time to plant!',
        sender_id: 'expert_001',
        sender_name: 'Dr. Sarah Kimani',
        timestamp: '2024-03-22T09:15:00Z',
        type: 'text'
      },
      unread_count: 3,
      is_archived: false,
      is_muted: false,
      settings: {
        allow_media: true,
        allow_voice: true,
        auto_translate: false,
        language_preference: 'en'
      }
    },
    {
      id: 'conv_002',
      type: 'direct',
      participants: [
        {
          user_id: 'user_001',
          name: 'John Mwangi',
          avatar: 'john_avatar.jpg',
          role: 'farmer',
          status: 'online',
          last_seen: '2024-03-22T10:00:00Z',
          permissions: {
            can_add_members: false,
            can_remove_members: false,
            can_edit_settings: false
          }
        },
        {
          user_id: 'mentor_001',
          name: 'Peter Kamau',
          avatar: 'peter_avatar.jpg',
          role: 'expert',
          status: 'online',
          last_seen: '2024-03-22T09:45:00Z',
          permissions: {
            can_add_members: false,
            can_remove_members: false,
            can_edit_settings: false
          }
        }
      ],
      created_by: 'user_001',
      created_at: '2024-03-20T00:00:00Z',
      last_message: {
        id: 'msg_latest_002',
        content: 'I can visit your farm tomorrow at 2 PM to check the crop rotation plan.',
        sender_id: 'mentor_001',
        sender_name: 'Peter Kamau',
        timestamp: '2024-03-22T09:45:00Z',
        type: 'text'
      },
      unread_count: 1,
      is_archived: false,
      is_muted: false,
      settings: {
        allow_media: true,
        allow_voice: true,
        auto_translate: true,
        language_preference: 'sw'
      }
    }
  ];

  const getSampleMessages = (): ChatMessage[] => [
    {
      id: 'msg_001',
      conversation_id: 'conv_001',
      content: 'Good morning everyone! How are your crops doing after the recent rains?',
      sender_id: 'user_001',
      sender_name: 'John Mwangi',
      sender_avatar: 'john_avatar.jpg',
      timestamp: '2024-03-22T07:00:00Z',
      type: 'text',
      attachments: [],
      reactions: {
        '👋': ['user_002', 'expert_001'],
        '🌱': ['expert_001']
      },
      is_edited: false,
      is_deleted: false,
      delivery_status: 'read'
    },
    {
      id: 'msg_002',
      conversation_id: 'conv_001',
      content: 'My tomatoes are looking great! The rain came at the perfect time.',
      sender_id: 'user_002',
      sender_name: 'Grace Wanjiku',
      sender_avatar: 'grace_avatar.jpg',
      timestamp: '2024-03-22T07:15:00Z',
      type: 'text',
      attachments: [
        {
          id: 'att_msg_001',
          type: 'image',
          url: 'tomato_plants.jpg',
          filename: 'healthy_tomatoes.jpg',
          size_bytes: 156789,
          thumbnail_url: 'tomato_plants_thumb.jpg'
        }
      ],
      reactions: {
        '🍅': ['user_001', 'expert_001'],
        '👍': ['user_001']
      },
      is_edited: false,
      is_deleted: false,
      delivery_status: 'read'
    },
    {
      id: 'msg_003',
      conversation_id: 'conv_001',
      content: 'The weather forecast shows rain next week. Good time to plant!',
      sender_id: 'expert_001',
      sender_name: 'Dr. Sarah Kimani',
      sender_avatar: 'sarah_avatar.jpg',
      timestamp: '2024-03-22T09:15:00Z',
      type: 'text',
      attachments: [],
      reactions: {
        '🌧️': ['user_001', 'user_002'],
        '📅': ['user_001']
      },
      is_edited: false,
      is_deleted: false,
      delivery_status: 'delivered'
    }
  ];

  const getSampleQuestions = (): QAQuestion[] => [
    {
      id: 'qa_001',
      title: 'My maize leaves are turning yellow - what could be the problem?',
      content: 'I planted maize 6 weeks ago and now the lower leaves are turning yellow and falling off. The plants are about 60cm tall. I applied DAP fertilizer at planting. What could be causing this?',
      category: 'Plant Health',
      tags: ['maize', 'yellowing', 'leaves', 'fertilizer', 'diagnosis'],
      asked_by: 'user_farmer_005',
      asked_by_name: 'Michael Oduya',
      asked_by_avatar: 'michael_avatar.jpg',
      asked_at: '2024-03-21T14:00:00Z',
      urgency_level: 'medium',
      crop_type: 'maize',
      location: 'Kisumu, Kenya',
      farm_size: 3,
      attachments: [
        {
          id: 'qa_att_001',
          type: 'image',
          url: 'yellow_maize_leaves.jpg',
          filename: 'maize_problem.jpg',
          size_bytes: 234567,
          thumbnail_url: 'yellow_maize_leaves_thumb.jpg',
          description: 'Yellowing maize leaves in my field'
        }
      ],
      status: 'answered',
      bounty: {
        amount: 500,
        currency: 'KES',
        sponsored_by: 'ZundeNova Community Fund'
      },
      engagement_stats: {
        views: 89,
        upvotes: 12,
        downvotes: 1,
        bookmarks: 8,
        shares: 3
      }
    },
    {
      id: 'qa_002',
      title: 'Best time to harvest passion fruits for maximum sweetness?',
      content: 'I have passion fruit vines that are producing well. When is the optimal time to harvest for the best taste and market value?',
      category: 'Harvesting',
      tags: ['passion fruit', 'harvest', 'timing', 'quality', 'market'],
      asked_by: 'user_farmer_006',
      asked_by_name: 'Ruth Wambui',
      asked_by_avatar: 'ruth_avatar.jpg',
      asked_at: '2024-03-22T08:30:00Z',
      urgency_level: 'low',
      crop_type: 'passion fruit',
      location: 'Meru, Kenya',
      farm_size: 1.5,
      attachments: [],
      status: 'open',
      engagement_stats: {
        views: 34,
        upvotes: 6,
        downvotes: 0,
        bookmarks: 4,
        shares: 1
      }
    }
  ];

  const getSampleAnswers = (): QAAnswer[] => [
    {
      id: 'ans_001',
      question_id: 'qa_001',
      content: 'The yellowing of lower leaves in maize at 6 weeks is typically normal senescence, especially if only the bottom leaves are affected. However, if it\'s spreading upward, it could indicate nitrogen deficiency. I recommend applying CAN fertilizer (50kg per hectare) and ensure adequate moisture. The plant looks healthy otherwise from your photo.',
      answered_by: 'expert_002',
      answered_by_name: 'Dr. James Mwangi',
      answered_by_avatar: 'james_expert_avatar.jpg',
      answered_by_role: 'expert',
      answered_at: '2024-03-21T16:30:00Z',
      is_accepted: true,
      is_expert_verified: true,
      confidence_score: 95,
      attachments: [
        {
          id: 'ans_att_001',
          type: 'image',
          url: 'maize_nitrogen_deficiency_chart.jpg',
          filename: 'nitrogen_deficiency_guide.jpg',
          size_bytes: 189456,
          thumbnail_url: 'nitrogen_chart_thumb.jpg',
          description: 'Visual guide to nitrogen deficiency in maize'
        }
      ],
      upvotes: 15,
      downvotes: 0,
      comments: [
        {
          id: 'comment_001',
          content: 'Thank you Dr. Mwangi! I applied CAN as you suggested and the plants are looking much better.',
          author_id: 'user_farmer_005',
          author_name: 'Michael Oduya',
          created_at: '2024-03-25T10:00:00Z',
          is_expert: false
        }
      ],
      verification: {
        verified_by: 'expert_001',
        verified_at: '2024-03-21T17:00:00Z',
        verification_notes: 'Accurate diagnosis and appropriate recommendation'
      }
    }
  ];

  const saveCommunityData = async () => {
    try {
      await offlineStorageService.storeOfflineData({
        id: 'forum_topics',
        type: 'marketplace' as any,
        data: forumTopics
      });
      
      await offlineStorageService.storeOfflineData({
        id: 'forum_posts',
        type: 'marketplace' as any,
        data: forumPosts
      });
      
      await offlineStorageService.storeOfflineData({
        id: 'chat_conversations',
        type: 'marketplace' as any,
        data: conversations
      });
      
      await offlineStorageService.storeOfflineData({
        id: 'chat_messages',
        type: 'marketplace' as any,
        data: messages
      });
    } catch (error) {
      console.error('Failed to save community data:', error);
    }
  };

  const createNewTopic = async (title: string, description: string, category: string, tags: string[]) => {
    const newTopic: ForumTopic = {
      id: `topic_${Date.now()}`,
      title,
      description,
      category,
      created_by: currentUserId,
      created_by_name: 'Current User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active',
      tags,
      post_count: 0,
      view_count: 0,
      last_activity: {
        user_id: currentUserId,
        user_name: 'Current User',
        timestamp: new Date().toISOString(),
        action: 'post'
      },
      moderation: {
        is_moderated: false
      },
      engagement_stats: {
        likes: 0,
        shares: 0,
        bookmarks: 0,
        expert_responses: 0
      }
    };

    setForumTopics([newTopic, ...forumTopics]);
    await saveCommunityData();
    Alert.alert('Success', 'New topic created successfully!');
  };

  const sendMessage = async (conversationId: string, content: string) => {
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversation_id: conversationId,
      content,
      sender_id: currentUserId,
      sender_name: 'Current User',
      timestamp: new Date().toISOString(),
      type: 'text',
      attachments: [],
      reactions: {},
      is_edited: false,
      is_deleted: false,
      delivery_status: 'sent'
    };

    setMessages([...messages, newMessage]);
    
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          last_message: {
            id: newMessage.id,
            content: newMessage.content,
            sender_id: newMessage.sender_id,
            sender_name: newMessage.sender_name,
            timestamp: newMessage.timestamp,
            type: newMessage.type
          }
        };
      }
      return conv;
    });
    
    setConversations(updatedConversations);
    await saveCommunityData();
    setNewMessageContent('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#22C55E';
      case 'closed': return '#6B7280';
      case 'pinned': return '#F59E0B';
      case 'archived': return '#9CA3AF';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🟢';
      case 'closed': return '🔒';
      case 'pinned': return '📌';
      case 'archived': return '📦';
      default: return '⚪';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'expert': return '#8B5CF6';
      case 'moderator': return '#EF4444';
      case 'lead_farmer': return '#F59E0B';
      case 'farmer': return '#22C55E';
      default: return '#6B7280';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'expert': return '🎓';
      case 'moderator': return '🛡️';
      case 'lead_farmer': return '🌟';
      case 'farmer': return '🌱';
      default: return '👤';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return '#DC2626';
      case 'high': return '#EA580C';
      case 'medium': return '#D97706';
      case 'low': return '#65A30D';
      default: return '#6B7280';
    }
  };

  const filteredTopics = forumTopics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || topic.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedTopics = [...filteredTopics].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      case 'popular':
        return b.engagement_stats.likes - a.engagement_stats.likes;
      case 'trending':
        return b.view_count - a.view_count;
      default:
        return 0;
    }
  });

  const categories = [...new Set(forumTopics.map(t => t.category))];

  const renderForums = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search forum topics..."
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
              style={[styles.filter, sortBy === 'recent' && styles.filterActive]}
              onPress={() => setSortBy('recent')}
            >
              <Text style={[styles.filterText, sortBy === 'recent' && styles.filterTextActive]}>
                Recent
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filter, sortBy === 'popular' && styles.filterActive]}
              onPress={() => setSortBy('popular')}
            >
              <Text style={[styles.filterText, sortBy === 'popular' && styles.filterTextActive]}>
                Popular
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filter, sortBy === 'trending' && styles.filterActive]}
              onPress={() => setSortBy('trending')}
            >
              <Text style={[styles.filterText, sortBy === 'trending' && styles.filterTextActive]}>
                Trending
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      <TouchableOpacity
        style={styles.createTopicButton}
        onPress={() => setShowTopicModal(true)}
      >
        <Text style={styles.createTopicButtonText}>+ Create New Topic</Text>
      </TouchableOpacity>

      {sortedTopics.map(topic => (
        <View key={topic.id} style={styles.topicCard}>
          <View style={styles.topicHeader}>
            <View style={styles.topicInfo}>
              <View style={styles.topicTitleRow}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={[styles.topicStatus, { color: getStatusColor(topic.status) }]}>
                  {getStatusIcon(topic.status)}
                </Text>
              </View>
              <Text style={styles.topicCategory}>{topic.category}</Text>
              <Text style={styles.topicAuthor}>
                by {topic.created_by_name} • {new Date(topic.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <Text style={styles.topicDescription} numberOfLines={3}>
            {topic.description}
          </Text>

          <View style={styles.topicTags}>
            {topic.tags.slice(0, 4).map(tag => (
              <View key={tag} style={styles.topicTag}>
                <Text style={styles.topicTagText}>#{tag}</Text>
              </View>
            ))}
            {topic.tags.length > 4 && (
              <Text style={styles.moreTags}>+{topic.tags.length - 4} more</Text>
            )}
          </View>

          <View style={styles.topicStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{topic.post_count}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{topic.view_count}</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{topic.engagement_stats.likes}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{topic.engagement_stats.expert_responses}</Text>
              <Text style={styles.statLabel}>Expert Replies</Text>
            </View>
          </View>

          <View style={styles.lastActivity}>
            <Text style={styles.lastActivityText}>
              Last activity by {topic.last_activity.user_name} • {' '}
              {new Date(topic.last_activity.timestamp).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.topicActions}>
            <TouchableOpacity
              style={styles.viewTopicButton}
              onPress={() => {
                setSelectedTopic(topic);
                setShowTopicModal(true);
              }}
            >
              <Text style={styles.viewTopicButtonText}>View Discussion</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.likeButton}>
              <Text style={styles.likeButtonText}>👍 {topic.engagement_stats.likes}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.bookmarkButton}>
              <Text style={styles.bookmarkButtonText}>🔖</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.shareButton}>
              <Text style={styles.shareButtonText}>📤</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderChat = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Your Conversations</Text>
      
      <TouchableOpacity
        style={styles.newChatButton}
        onPress={() => setShowChatModal(true)}
      >
        <Text style={styles.newChatButtonText}>+ Start New Conversation</Text>
      </TouchableOpacity>

      {conversations.map(conversation => (
        <View key={conversation.id} style={styles.conversationCard}>
          <View style={styles.conversationHeader}>
            <View style={styles.conversationInfo}>
              <Text style={styles.conversationTitle}>
                {conversation.title || `Chat with ${conversation.participants.filter(p => p.user_id !== currentUserId).map(p => p.name).join(', ')}`}
              </Text>
              <Text style={styles.conversationType}>
                {conversation.type === 'group' ? '👥 Group' : '💬 Direct'} • {conversation.participants.length} members
              </Text>
            </View>
            
            {conversation.unread_count > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{conversation.unread_count}</Text>
              </View>
            )}
          </View>

          <View style={styles.lastMessage}>
            <Text style={styles.lastMessageSender}>{conversation.last_message.sender_name}:</Text>
            <Text style={styles.lastMessageContent} numberOfLines={2}>
              {conversation.last_message.content}
            </Text>
            <Text style={styles.lastMessageTime}>
              {new Date(conversation.last_message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          <View style={styles.conversationParticipants}>
            {conversation.participants.slice(0, 4).map(participant => (
              <View key={participant.user_id} style={styles.participantItem}>
                <Text style={[styles.participantRole, { color: getRoleColor(participant.role) }]}>
                  {getRoleIcon(participant.role)}
                </Text>
                <Text style={styles.participantName}>{participant.name}</Text>
                <View style={[styles.statusIndicator, { backgroundColor: participant.status === 'online' ? '#22C55E' : '#9CA3AF' }]} />
              </View>
            ))}
            {conversation.participants.length > 4 && (
              <Text style={styles.moreParticipants}>+{conversation.participants.length - 4} more</Text>
            )}
          </View>

          <View style={styles.conversationActions}>
            <TouchableOpacity
              style={styles.openChatButton}
              onPress={() => {
                setSelectedConversation(conversation);
                setShowChatModal(true);
              }}
            >
              <Text style={styles.openChatButtonText}>Open Chat</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.muteButton}>
              <Text style={styles.muteButtonText}>
                {conversation.is_muted ? '🔇' : '🔔'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.archiveButton}>
              <Text style={styles.archiveButtonText}>📁</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderQA = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Questions & Answers</Text>
      
      <TouchableOpacity
        style={styles.askQuestionButton}
        onPress={() => setShowQuestionModal(true)}
      >
        <Text style={styles.askQuestionButtonText}>+ Ask a Question</Text>
      </TouchableOpacity>

      {qaQuestions.map(question => {
        const answers = qaAnswers.filter(a => a.question_id === question.id);
        const acceptedAnswer = answers.find(a => a.is_accepted);
        
        return (
          <View key={question.id} style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <View style={styles.questionInfo}>
                <Text style={styles.questionTitle}>{question.title}</Text>
                <View style={styles.questionMeta}>
                  <Text style={styles.questionCategory}>{question.category}</Text>
                  <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(question.urgency_level) }]}>
                    <Text style={styles.urgencyBadgeText}>{question.urgency_level.toUpperCase()}</Text>
                  </View>
                  {question.status === 'answered' && (
                    <View style={styles.answeredBadge}>
                      <Text style={styles.answeredBadgeText}>✅ ANSWERED</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <Text style={styles.questionContent} numberOfLines={4}>
              {question.content}
            </Text>

            <View style={styles.questionDetails}>
              <Text style={styles.questionDetail}>
                Asked by {question.asked_by_name} • {new Date(question.asked_at).toLocaleDateString()}
              </Text>
              {question.location && (
                <Text style={styles.questionDetail}>📍 {question.location}</Text>
              )}
              {question.crop_type && (
                <Text style={styles.questionDetail}>🌱 {question.crop_type}</Text>
              )}
              {question.farm_size && (
                <Text style={styles.questionDetail}>🏞️ {question.farm_size} hectares</Text>
              )}
            </View>

            <View style={styles.questionTags}>
              {question.tags.slice(0, 4).map(tag => (
                <View key={tag} style={styles.questionTag}>
                  <Text style={styles.questionTagText}>#{tag}</Text>
                </View>
              ))}
            </View>

            <View style={styles.questionStats}>
              <View style={styles.questionStat}>
                <Text style={styles.questionStatValue}>{question.engagement_stats.views}</Text>
                <Text style={styles.questionStatLabel}>Views</Text>
              </View>
              
              <View style={styles.questionStat}>
                <Text style={styles.questionStatValue}>{answers.length}</Text>
                <Text style={styles.questionStatLabel}>Answers</Text>
              </View>
              
              <View style={styles.questionStat}>
                <Text style={styles.questionStatValue}>{question.engagement_stats.upvotes}</Text>
                <Text style={styles.questionStatLabel}>Upvotes</Text>
              </View>
              
              <View style={styles.questionStat}>
                <Text style={styles.questionStatValue}>{question.engagement_stats.bookmarks}</Text>
                <Text style={styles.questionStatLabel}>Bookmarks</Text>
              </View>
            </View>

            {question.bounty && (
              <View style={styles.bountyContainer}>
                <Text style={styles.bountyText}>
                  💰 Bounty: {question.bounty.amount} {question.bounty.currency}
                  {question.bounty.sponsored_by && ` (by ${question.bounty.sponsored_by})`}
                </Text>
              </View>
            )}

            {acceptedAnswer && (
              <View style={styles.acceptedAnswerPreview}>
                <Text style={styles.acceptedAnswerTitle}>✅ Accepted Answer</Text>
                <Text style={styles.acceptedAnswerContent} numberOfLines={3}>
                  {acceptedAnswer.content}
                </Text>
                <Text style={styles.acceptedAnswerAuthor}>
                  by {acceptedAnswer.answered_by_name} {getRoleIcon(acceptedAnswer.answered_by_role)}
                </Text>
              </View>
            )}

            <View style={styles.questionActions}>
              <TouchableOpacity
                style={styles.viewQuestionButton}
                onPress={() => {
                  setSelectedQuestion(question);
                  setShowQuestionModal(true);
                }}
              >
                <Text style={styles.viewQuestionButtonText}>View Full Question</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.upvoteButton}>
                <Text style={styles.upvoteButtonText}>👍 {question.engagement_stats.upvotes}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.answerButton}>
                <Text style={styles.answerButtonText}>💬 Answer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.bookmarkQuestionButton}>
                <Text style={styles.bookmarkQuestionButtonText}>🔖</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );

  const renderEvents = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Community Events</Text>
      
      <View style={styles.comingSoonContainer}>
        <Text style={styles.comingSoonText}>🎉 Events & Meetups Coming Soon!</Text>
        <Text style={styles.comingSoonDescription}>
          Virtual and physical farmer meetups, auction days, and procurement fairs will be available here.
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Hub</Text>
        <Text style={styles.subtitle}>Connect, learn & grow together</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'forums' && styles.activeTab]}
          onPress={() => setActiveTab('forums')}
        >
          <Text style={[styles.tabText, activeTab === 'forums' && styles.activeTabText]}>
            Forums ({sortedTopics.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>
            Chat ({conversations.filter(c => c.unread_count > 0).length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'qa' && styles.activeTab]}
          onPress={() => setActiveTab('qa')}
        >
          <Text style={[styles.tabText, activeTab === 'qa' && styles.activeTabText]}>
            Q&A ({qaQuestions.filter(q => q.status === 'open').length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
            Events
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'forums' && renderForums()}
      {activeTab === 'chat' && renderChat()}
      {activeTab === 'qa' && renderQA()}
      {activeTab === 'events' && renderEvents()}
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
    fontSize: 12,
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
  createTopicButton: {
    backgroundColor: '#228B22',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  createTopicButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  topicCard: {
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
  topicHeader: {
    marginBottom: 12,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  topicStatus: {
    fontSize: 16,
    marginLeft: 8,
  },
  topicCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  topicAuthor: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  topicDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  topicTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  topicTag: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  topicTagText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '600',
  },
  moreTags: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    alignSelf: 'center',
  },
  topicStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
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
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  lastActivity: {
    marginBottom: 12,
  },
  lastActivityText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  topicActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewTopicButton: {
    backgroundColor: '#228B22',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  viewTopicButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  likeButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 4,
  },
  likeButtonText: {
    fontSize: 12,
    color: '#6B7280',
  },
  bookmarkButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 4,
  },
  bookmarkButtonText: {
    fontSize: 14,
  },
  shareButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  shareButtonText: {
    fontSize: 14,
  },
  newChatButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  newChatButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  conversationCard: {
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
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  conversationType: {
    fontSize: 12,
    color: '#6B7280',
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lastMessage: {
    marginBottom: 12,
  },
  lastMessageSender: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  lastMessageContent: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 4,
  },
  lastMessageTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  conversationParticipants: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  participantRole: {
    fontSize: 12,
    marginRight: 4,
  },
  participantName: {
    fontSize: 12,
    color: '#374151',
    marginRight: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moreParticipants: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    alignSelf: 'center',
  },
  conversationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  openChatButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  openChatButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  muteButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 4,
  },
  muteButtonText: {
    fontSize: 14,
  },
  archiveButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  archiveButtonText: {
    fontSize: 14,
  },
  askQuestionButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  askQuestionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  questionCard: {
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
  questionHeader: {
    marginBottom: 12,
  },
  questionInfo: {
    flex: 1,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  questionCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 8,
  },
  urgencyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  urgencyBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  answeredBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  answeredBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  questionContent: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  questionDetails: {
    marginBottom: 12,
  },
  questionDetail: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  questionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  questionTag: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  questionTagText: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '600',
  },
  questionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  questionStat: {
    alignItems: 'center',
  },
  questionStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 2,
  },
  questionStatLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  bountyContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  bountyText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },
  acceptedAnswerPreview: {
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  acceptedAnswerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
  },
  acceptedAnswerContent: {
    fontSize: 12,
    color: '#166534',
    lineHeight: 16,
    marginBottom: 8,
  },
  acceptedAnswerAuthor: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  questionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewQuestionButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  viewQuestionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  upvoteButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 4,
  },
  upvoteButtonText: {
    fontSize: 12,
    color: '#6B7280',
  },
  answerButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 4,
  },
  answerButtonText: {
    fontSize: 12,
    color: '#6B7280',
  },
  bookmarkQuestionButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 6,
  },
  bookmarkQuestionButtonText: {
    fontSize: 12,
  },
  comingSoonContainer: {
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
  comingSoonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  comingSoonDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CommunityHub;
