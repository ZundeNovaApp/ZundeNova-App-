'use client';

import React from 'react';
import CommunityForum from '../../components/CommunityForum';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
          <p className="mt-2 text-gray-600">
            Connect with fellow farmers, experts, and agricultural professionals. Share knowledge, ask questions, and learn together.
          </p>
        </div>
        
        <CommunityForum />
      </div>
    </div>
  );
}
