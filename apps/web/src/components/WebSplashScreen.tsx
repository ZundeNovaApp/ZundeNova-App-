"use client";

import React, { useState, useEffect } from 'react';

interface WebSplashScreenProps {
  onComplete: () => void;
  userRole?: 'farmer' | 'vet' | 'ngo' | 'coop' | 'investor' | 'admin';
}

export default function WebSplashScreen({ onComplete, userRole = 'farmer' }: WebSplashScreenProps) {
  const animationStyles = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from { transform: translateX(-50px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeInUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes slideInLeft {
      from { transform: translateX(-20px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes bounceIn {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }
    @keyframes scaleIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes spinSlow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-fade-in { animation: fadeIn 0.6s ease-out; }
    .animate-slide-in { animation: slideIn 0.5s ease-out; }
    .animate-fade-in-up { animation: fadeInUp 0.6s ease-out; }
    .animate-slide-in-left { animation: slideInLeft 0.6s ease-out; }
    .animate-bounce-in { animation: bounceIn 0.8s ease-out; }
    .animate-scale-in { animation: scaleIn 0.8s ease-out; }
    .animate-spin-slow { animation: spinSlow 2s linear infinite; }
  `;

  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = animationStyles;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const splashSteps = [
    {
      title: 'Welcome to ZundeNova',
      subtitle: 'Smart Agricultural Platform for Africa',
      icon: '🌱',
      description: 'AI-powered tools for modern farming, livestock care, and agricultural business management',
      color: 'from-green-700 to-green-600',
      features: [
        'AI-Powered Diagnostics',
        'Real-time Weather & Satellite Data',
        'Marketplace & Financial Services',
        'Expert Consultations & Community'
      ]
    },
    {
      title: 'Advanced Analytics',
      subtitle: 'Data-Driven Agricultural Insights',
      icon: '📊',
      description: 'Comprehensive dashboards and reporting tools for informed decision making',
      color: 'from-teal-700 to-teal-600',
      features: [
        'Farm Performance Analytics',
        'Market Trend Analysis',
        'Financial Reporting',
        'Impact Measurement'
      ]
    },
    {
      title: 'Collaborative Platform',
      subtitle: 'Connect with Agricultural Ecosystem',
      icon: '🤝',
      description: 'Join a network of farmers, experts, NGOs, and agricultural professionals',
      color: 'from-yellow-600 to-yellow-500',
      features: [
        'Expert Network Access',
        'Peer-to-Peer Learning',
        'NGO & Government Programs',
        'Investment Opportunities'
      ]
    },
    {
      title: 'Mobile-First Design',
      subtitle: 'Accessible Anywhere, Anytime',
      icon: '📱',
      description: 'Optimized for mobile devices with offline capabilities for rural areas',
      color: 'from-green-700 to-teal-600',
      features: [
        'Offline Functionality',
        'USSD & SMS Support',
        'Multi-language Interface',
        'Low-bandwidth Optimization'
      ]
    }
  ];

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(onComplete, 500);
            return 100;
          }
          return prev + 2;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isLoading, onComplete]);

  const handleNext = () => {
    if (currentStep < splashSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsLoading(true);
    }
  };

  const handleSkip = () => {
    setIsLoading(true);
  };

  const currentStepData = splashSteps[currentStep];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-700 to-teal-600 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-8xl mb-8 animate-spin-slow">
            🌱
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">ZundeNova</h1>
          <p className="text-xl text-green-100 mb-8">Initializing your agricultural dashboard...</p>
          
          <div className="w-80 bg-white/20 rounded-full h-2 mb-4">
            <div
              className="bg-yellow-400 h-2 rounded-full transition-all duration-100"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          
          <p className="text-green-100">{loadingProgress}% Complete</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentStepData.color} relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Header */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={handleSkip}
          className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors duration-200"
        >
          Skip Tour
        </button>
      </div>

      {/* User Role Badge */}
      <div className="absolute top-6 left-6 z-10">
        <div className="px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium">
          {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex space-x-2">
          {splashSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'w-8 bg-yellow-400'
                  : index < currentStep
                  ? 'w-2 bg-white'
                  : 'w-2 bg-white/30'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="text-white animate-slide-in">
              <div className="text-8xl mb-6 animate-bounce-in">
                {currentStepData.icon}
              </div>

              <h1 className="text-5xl font-bold mb-4 animate-fade-in-up">
                {currentStepData.title}
              </h1>

              <h2 className="text-2xl text-white/90 mb-6 font-medium animate-fade-in-up">
                {currentStepData.subtitle}
              </h2>

              <p className="text-lg text-white/80 mb-8 leading-relaxed animate-fade-in-up">
                {currentStepData.description}
              </p>

              <div className="space-y-3 animate-fade-in-up">
                {currentStepData.features.map((feature, index) => (
                  <div
                    key={feature}
                    className="flex items-center space-x-3 animate-slide-in-left"
                    style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                  >
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <span className="text-white/90">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

          {/* Right Side - Interactive Demo */}
          <div className="relative animate-scale-in">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="bg-white rounded-xl p-6 shadow-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <div className="flex-1 bg-gray-100 rounded px-3 py-1 text-sm text-gray-600">
                    zundenova.com/{userRole}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold">Z</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">ZundeNova Dashboard</div>
                      <div className="text-sm text-gray-500">{userRole} Portal</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {currentStepData.features.map((feature, index) => (
                      <div
                        key={feature}
                        className="bg-gray-50 rounded-lg p-3 text-center animate-fade-in"
                        style={{ animationDelay: `${1 + index * 0.1}s` }}
                      >
                        <div className="text-2xl mb-1">
                          {index === 0 ? '🤖' : index === 1 ? '📊' : index === 2 ? '💰' : '👥'}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">
                          {feature}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg p-4 text-white">
                    <div className="text-sm font-medium mb-1">Quick Stats</div>
                    <div className="text-2xl font-bold">
                      {currentStep === 0 ? '10,000+' : currentStep === 1 ? '95%' : currentStep === 2 ? '500+' : '24/7'}
                    </div>
                    <div className="text-xs opacity-90">
                      {currentStep === 0 ? 'Active Farmers' : currentStep === 1 ? 'Accuracy Rate' : currentStep === 2 ? 'Expert Network' : 'Support Available'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-full transition-all duration-200 ${
              currentStep === 0
                ? 'bg-white/10 text-white/50 cursor-not-allowed'
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            ← Previous
          </button>

          <button
            onClick={handleNext}
            className="px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-gray-800 rounded-full font-semibold transition-all duration-200 transform hover:scale-105"
          >
            {currentStep === splashSteps.length - 1 ? 'Get Started →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
