'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'error';
}

interface Suggestion {
  id: string;
  text: string;
  category: string;
}

export default function EnhancedAIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your ZundeNova AI assistant. I can help you with farming questions, crop diseases, livestock care, and agricultural best practices. What would you like to know?',
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions] = useState<Suggestion[]>([
    { id: '1', text: 'How do I treat tomato blight?', category: 'Disease' },
    { id: '2', text: 'Best time to plant maize in Kenya', category: 'Planting' },
    { id: '3', text: 'Signs of healthy soil', category: 'Soil' },
    { id: '4', text: 'Cattle vaccination schedule', category: 'Livestock' },
  ]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await fetch('/api/ai/chat/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          text: textToSend,
          language: 'en',
          farmId: localStorage.getItem('currentFarmId'),
        }),
      });

      let data;
      if (response.ok) {
        data = await response.json();
      } else {
        data = {
          answer: 'I apologize, but I\'m having trouble processing your request right now. Please try again later or contact support if the issue persists.',
          confidence: 0.5
        };
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.answer || 'Sorry, I couldn\'t process your request.',
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I\'m experiencing technical difficulties. Please check your connection and try again.',
        isUser: false,
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: 'Chat cleared! How can I help you today?',
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      }
    ]);
    setShowSuggestions(true);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white border border-gray-200 rounded-lg shadow-lg">
      <div className="text-white p-4 rounded-t-lg flex items-center justify-between" style={{backgroundColor: '#00684b'}}>
        <div>
          <h3 className="text-lg font-semibold">🌱 ZundeNova AI Assistant</h3>
          <p className="text-sm opacity-90">Your farming expert is here to help</p>
        </div>
        <button
          onClick={clearChat}
          className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-md transition-colors"
          title="Clear chat"
        >
          🗑️
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                message.isUser
                  ? 'text-white shadow-md'
                  : message.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-gray-100 text-gray-800 shadow-sm'
              }`}
              style={message.isUser ? {backgroundColor: '#00684b'} : {}}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
              <p className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}

        {showSuggestions && messages.length === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 font-medium">💡 Try asking about:</p>
            <div className="grid grid-cols-1 gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => sendMessage(suggestion.text)}
                  className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-800">{suggestion.text}</span>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      {suggestion.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about crops, livestock, soil, diseases..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={2}
            maxLength={500}
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center"
            style={{backgroundColor: '#00684b'}}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              'Send'
            )}
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            {inputText.length}/500 characters
          </p>
          <p className="text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
