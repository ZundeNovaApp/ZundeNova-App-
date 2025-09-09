import { Router } from 'express';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/posts', async (req: AuthenticatedRequest, res) => {
  try {
    const { category, limit = 20, offset = 0 } = req.query;
    
    const posts = [
      {
        id: '1',
        title: 'Best practices for maize farming in rainy season',
        content: 'Looking for advice on optimal planting density and fertilizer application for maize during the upcoming rainy season. What has worked best for you?',
        author: 'John Farmer',
        authorId: 'user123',
        authorRole: 'FARMER',
        category: 'crop_management',
        tags: ['maize', 'fertilizer', 'rainy_season'],
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15'),
        replies: 5,
        likes: 12,
        views: 45,
        isResolved: false,
        location: 'Nairobi, Kenya'
      },
      {
        id: '2',
        title: 'Cattle vaccination schedule - need expert advice',
        content: 'My cattle are due for vaccination but I\'m not sure about the timing. The vet is not available this week. What should I do?',
        author: 'Mary Livestock',
        authorId: 'user456',
        authorRole: 'FARMER',
        category: 'livestock_health',
        tags: ['cattle', 'vaccination', 'veterinary'],
        createdAt: new Date('2024-03-14'),
        updatedAt: new Date('2024-03-14'),
        replies: 8,
        likes: 18,
        views: 67,
        isResolved: true,
        location: 'Nakuru, Kenya'
      },
      {
        id: '3',
        title: 'Organic pest control methods that actually work',
        content: 'Sharing my experience with neem oil and companion planting. These methods have reduced pest damage by 70% on my farm.',
        author: 'Dr. Peter Kimani',
        authorId: 'expert789',
        authorRole: 'EXPERT',
        category: 'pest_management',
        tags: ['organic', 'pest_control', 'neem_oil'],
        createdAt: new Date('2024-03-13'),
        updatedAt: new Date('2024-03-13'),
        replies: 15,
        likes: 35,
        views: 120,
        isResolved: false,
        location: 'Eldoret, Kenya'
      },
      {
        id: '4',
        title: 'Market prices for tomatoes - where to sell?',
        content: 'Harvested 2 tons of tomatoes. Looking for the best markets with good prices. Any recommendations?',
        author: 'Grace Horticulture',
        authorId: 'user101',
        authorRole: 'FARMER',
        category: 'market_access',
        tags: ['tomatoes', 'market_prices', 'selling'],
        createdAt: new Date('2024-03-12'),
        updatedAt: new Date('2024-03-12'),
        replies: 3,
        likes: 7,
        views: 28,
        isResolved: false,
        location: 'Mombasa, Kenya'
      }
    ];
    
    let filteredPosts = posts;
    if (category) {
      filteredPosts = posts.filter(post => post.category === category);
    }
    
    const paginatedPosts = filteredPosts.slice(Number(offset), Number(offset) + Number(limit));
    
    res.json({
      posts: paginatedPosts,
      total: filteredPosts.length,
      hasMore: Number(offset) + Number(limit) < filteredPosts.length
    });
  } catch (error) {
    console.error('Community posts error:', error);
    res.status(500).json({ error: 'Failed to fetch community posts' });
  }
});

router.get('/posts/:postId', async (req: AuthenticatedRequest, res) => {
  try {
    const { postId } = req.params;
    
    const post = {
      id: postId,
      title: 'Best practices for maize farming in rainy season',
      content: 'Looking for advice on optimal planting density and fertilizer application for maize during the upcoming rainy season. What has worked best for you?',
      author: 'John Farmer',
      authorId: 'user123',
      authorRole: 'FARMER',
      category: 'crop_management',
      tags: ['maize', 'fertilizer', 'rainy_season'],
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2024-03-15'),
      likes: 12,
      views: 45,
      isResolved: false,
      location: 'Nairobi, Kenya',
      replies: [
        {
          id: 'reply1',
          content: 'I recommend 75,000 plants per hectare for optimal yield. Use DAP fertilizer at planting.',
          author: 'Expert Agronomist',
          authorId: 'expert456',
          authorRole: 'EXPERT',
          createdAt: new Date('2024-03-15'),
          likes: 5,
          isAcceptedAnswer: true
        },
        {
          id: 'reply2',
          content: 'Also consider soil testing before fertilizer application. It makes a big difference.',
          author: 'Experienced Farmer',
          authorId: 'user789',
          authorRole: 'FARMER',
          createdAt: new Date('2024-03-15'),
          likes: 3,
          isAcceptedAnswer: false
        }
      ]
    };
    
    res.json(post);
  } catch (error) {
    console.error('Post fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

router.post('/posts', async (req: AuthenticatedRequest, res) => {
  try {
    const { title, content, category, tags, location } = req.body;
    
    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }
    
    const post = {
      id: Date.now().toString(),
      title,
      content,
      category,
      tags: tags || [],
      location,
      authorId: req.user!.uid,
      author: req.user!.email || 'Anonymous User',
      authorRole: req.user!.role || 'FARMER',
      createdAt: new Date(),
      updatedAt: new Date(),
      replies: 0,
      likes: 0,
      views: 0,
      isResolved: false
    };
    
    res.status(201).json(post);
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

router.post('/posts/:postId/replies', async (req: AuthenticatedRequest, res) => {
  try {
    const { postId } = req.params;
    const { content, isAnswer = false } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Reply content is required' });
    }
    
    const reply = {
      id: Date.now().toString(),
      postId,
      content,
      authorId: req.user!.uid,
      author: req.user!.email || 'Anonymous User',
      authorRole: req.user!.role || 'FARMER',
      createdAt: new Date(),
      likes: 0,
      isAcceptedAnswer: isAnswer && (req.user!.role === 'EXPERT' || req.user!.role === 'VET')
    };
    
    res.status(201).json(reply);
  } catch (error) {
    console.error('Reply creation error:', error);
    res.status(500).json({ error: 'Failed to create reply' });
  }
});

router.post('/posts/:postId/like', async (req: AuthenticatedRequest, res) => {
  try {
    const { postId } = req.params;
    
    const like = {
      postId,
      userId: req.user!.uid,
      createdAt: new Date()
    };
    
    res.json({ message: 'Post liked successfully', like });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

router.get('/categories', async (req: AuthenticatedRequest, res) => {
  try {
    const categories = [
      {
        id: 'crop_management',
        name: 'Crop Management',
        description: 'Planting, fertilization, irrigation, and harvesting',
        icon: '🌾',
        postCount: 45
      },
      {
        id: 'livestock_health',
        name: 'Livestock Health',
        description: 'Animal health, veterinary care, and breeding',
        icon: '🐄',
        postCount: 32
      },
      {
        id: 'pest_management',
        name: 'Pest & Disease Control',
        description: 'Pest identification, treatment, and prevention',
        icon: '🐛',
        postCount: 28
      },
      {
        id: 'market_access',
        name: 'Market Access',
        description: 'Selling produce, pricing, and market information',
        icon: '🏪',
        postCount: 21
      },
      {
        id: 'technology',
        name: 'Farm Technology',
        description: 'Equipment, tools, and digital solutions',
        icon: '🚜',
        postCount: 15
      },
      {
        id: 'finance',
        name: 'Agricultural Finance',
        description: 'Loans, insurance, and financial planning',
        icon: '💰',
        postCount: 18
      }
    ];
    
    res.json(categories);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/experts', async (req: AuthenticatedRequest, res) => {
  try {
    const experts = [
      {
        id: 'expert1',
        name: 'Dr. Sarah Mwangi',
        role: 'EXPERT',
        specialty: 'Veterinary Medicine',
        rating: 4.9,
        totalConsultations: 156,
        yearsExperience: 12,
        languages: ['English', 'Swahili'],
        location: 'Nairobi, Kenya',
        isOnline: true,
        responseTime: '< 2 hours'
      },
      {
        id: 'expert2',
        name: 'Prof. James Ochieng',
        role: 'EXPERT',
        specialty: 'Crop Science',
        rating: 4.8,
        totalConsultations: 203,
        yearsExperience: 18,
        languages: ['English', 'Swahili', 'Luo'],
        location: 'Eldoret, Kenya',
        isOnline: false,
        responseTime: '< 4 hours'
      }
    ];
    
    res.json(experts);
  } catch (error) {
    console.error('Experts error:', error);
    res.status(500).json({ error: 'Failed to fetch experts' });
  }
});

export { router as communityRoutes };
