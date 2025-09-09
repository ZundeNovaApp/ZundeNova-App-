import React from 'react';
import EnhancedAIChat from '../../components/EnhancedAIChat';

export default function AIChatPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">AI Assistant</h1>
          <EnhancedAIChat />
        </div>
      </div>
    </div>
  );
}
