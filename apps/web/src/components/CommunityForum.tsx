'use client';

import React, { useState, useEffect } from 'react';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  authorRole: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  replies: number;
  likes: number;
  views: number;
  isResolved: boolean;
  location: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  postCount: number;
}

interface Expert {
  id: string;
  name: string;
  role: string;
  specialty: string;
  rating: number;
  totalConsultations: number;
  yearsExperience: number;
  languages: string[];
  location: string;
  isOnline: boolean;
  responseTime: string;
}

export default function CommunityForum() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'categories' | 'experts'>('posts');

  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    location: ''
  });

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [postsRes, categoriesRes, expertsRes] = await Promise.all([
        fetch(`/api/community/posts${selectedCategory ? `?category=${selectedCategory}` : ''}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/community/categories', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/community/experts', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (!postsRes.ok || !categoriesRes.ok || !expertsRes.ok) {
        throw new Error('Failed to fetch community data');
      }

      const [postsData, categoriesData, expertsData] = await Promise.all([
        postsRes.json(),
        categoriesRes.json(),
        expertsRes.json()
      ]);

      setPosts(postsData.posts || postsData);
      setCategories(categoriesData);
      setExperts(expertsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load community data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPost.title.trim() || !newPost.content.trim() || !newPost.category) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newPost,
          tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const createdPost = await response.json();
      setPosts(prev => [createdPost, ...prev]);
      setNewPost({ title: '', content: '', category: '', tags: '', location: '' });
      setShowNewPostForm(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      ));
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      'FARMER': 'bg-green-100 text-green-800',
      'EXPERT': 'bg-blue-100 text-blue-800',
      'VET': 'bg-purple-100 text-purple-800',
      'NGO': 'bg-orange-100 text-orange-800',
      'ADMIN': 'bg-red-100 text-red-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
          <button
            onClick={() => setShowNewPostForm(!showNewPostForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200"
          >
            {showNewPostForm ? 'Cancel' : 'New Post'}
          </button>
        </div>

        <div className="flex space-x-1 mb-6">
          {(['posts', 'categories', 'experts'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTab === tab
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {showNewPostForm && (
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Post</h3>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter post title"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={newPost.location}
                    onChange={(e) => setNewPost(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Your location"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Describe your question or share your knowledge..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter tags separated by commas"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200"
                >
                  Create Post
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewPostForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {activeTab === 'posts' && (
        <div className="space-y-6">
          {categories.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                    selectedCategory === ''
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Categories
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-green-600 cursor-pointer">
                        {post.title}
                      </h3>
                      {post.isResolved && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.content}</p>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">{post.author}</span>
                          <span className={`px-2 py-1 rounded text-xs ${getRoleColor(post.authorRole)}`}>
                            {post.authorRole}
                          </span>
                        </div>
                        {post.location && (
                          <span className="text-gray-400">📍 {post.location}</span>
                        )}
                      </div>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>👁️ {post.views} views</span>
                    <span>💬 {post.replies} replies</span>
                  </div>
                  
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-green-600 transition-colors duration-200"
                  >
                    <span>👍</span>
                    <span>{post.likes}</span>
                  </button>
                </div>
              </div>
            ))}

            {posts.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">💬</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-4">
                  {selectedCategory ? 'No posts in this category.' : 'Be the first to start a discussion!'}
                </p>
                <button
                  onClick={() => setShowNewPostForm(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200"
                >
                  Create First Post
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <div key={category.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-3xl">{category.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.postCount} posts</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">{category.description}</p>
              <button
                onClick={() => {
                  setSelectedCategory(category.id);
                  setActiveTab('posts');
                }}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                View Posts →
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'experts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {experts.map(expert => (
            <div key={expert.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{expert.name}</h3>
                    <div className={`w-3 h-3 rounded-full ${expert.isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{expert.specialty}</p>
                  <p className="text-sm text-gray-500 mb-2">📍 {expert.location}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <span>⭐ {expert.rating} ({expert.totalConsultations} consultations)</span>
                    <span>📅 {expert.yearsExperience} years</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {expert.languages.map((lang, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        {lang}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-sm text-gray-500">Response time: {expert.responseTime}</p>
                </div>
              </div>
              
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200">
                Contact Expert
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
