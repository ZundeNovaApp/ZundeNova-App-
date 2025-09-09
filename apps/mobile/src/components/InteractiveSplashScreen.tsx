import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Image } from 'react-native';

interface SplashScreenProps {
  onComplete: () => void;
  userType?: 'farmer' | 'vet' | 'ngo' | 'coop' | 'investor';
}

export default function InteractiveSplashScreen({ onComplete, userType = 'farmer' }: SplashScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [slideAnim] = useState(new Animated.Value(50));
  const [isLoading, setIsLoading] = useState(false);

  const { width, height } = Dimensions.get('window');

  const splashSteps = [
    {
      title: 'Welcome to ZundeNova',
      subtitle: 'Smart Care for Land, Livestock & Life',
      icon: '🌱',
      description: 'AI-powered agricultural platform designed for African farmers',
      color: '#00684b',
      features: ['AI Diagnostics', 'Weather Insights', 'Market Access', 'Expert Consultation']
    },
    {
      title: 'AI-Powered Diagnostics',
      subtitle: 'Instant Plant & Livestock Health Analysis',
      icon: '🤖',
      description: 'Take photos to get instant diagnosis and treatment recommendations',
      color: '#007f82',
      features: ['Offline AI Models', 'Voice Input', 'Multi-language Support', 'Expert Validation']
    },
    {
      title: 'Smart Marketplace',
      subtitle: 'Connect with Buyers & Suppliers',
      icon: '🛒',
      description: 'Access quality inputs, sell your produce, and get fair prices',
      color: '#dbc600',
      features: ['Quality Grading', 'Price Tracking', 'Secure Payments', 'Logistics Support']
    },
    {
      title: 'Financial Services',
      subtitle: 'Micro-loans & Insurance Made Easy',
      icon: '💰',
      description: 'Access credit, insurance, and financial tools tailored for farmers',
      color: '#00684b',
      features: ['Micro-lending', 'Crop Insurance', 'Payment Solutions', 'Credit Scoring']
    },
    {
      title: 'Community & Learning',
      subtitle: 'Learn, Share, and Grow Together',
      icon: '👥',
      description: 'Join a community of farmers, experts, and agricultural professionals',
      color: '#007f82',
      features: ['Q&A Forums', 'Educational Content', 'Peer Mentoring', 'Expert Consultations']
    }
  ];

  useEffect(() => {
    startAnimations();
  }, [currentStep]);

  const startAnimations = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    slideAnim.setValue(50);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    if (currentStep < splashSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const currentStepData = splashSteps[currentStep];

  if (isLoading) {
    return (
      <View
        style={[styles.container, { backgroundColor: '#00684b' }]}
      >
        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.logoIcon}>🌱</Text>
            <Text style={styles.logoText}>ZundeNova</Text>
          </Animated.View>
          
          <View style={styles.loadingIndicator}>
            <View style={styles.loadingBar}>
              <Animated.View style={[styles.loadingProgress, { width: '100%' }]} />
            </View>
            <Text style={styles.loadingText}>Initializing your agricultural assistant...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: currentStepData.color }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {splashSteps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentStep && styles.progressDotActive,
              index < currentStep && styles.progressDotCompleted
            ]}
          />
        ))}
      </View>

      {/* Main Content */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim }
            ]
          }
        ]}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.stepIcon}>{currentStepData.icon}</Text>
        </View>

        {/* Title and Subtitle */}
        <Text style={styles.title}>{currentStepData.title}</Text>
        <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
        <Text style={styles.description}>{currentStepData.description}</Text>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          {currentStepData.features.map((feature, index) => (
            <Animated.View
              key={index}
              style={[
                styles.featureItem,
                {
                  opacity: fadeAnim,
                  transform: [{
                    translateX: Animated.add(slideAnim, new Animated.Value(index * 10))
                  }]
                }
              ]}
            >
              <Text style={[styles.featureText, { color: '#dbc600' }]}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
          disabled={currentStep === 0}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            {currentStep === 0 ? '' : 'Previous'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {currentStep === splashSteps.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Text style={styles.buttonIcon}>
            {currentStep === splashSteps.length - 1 ? "🚀" : "→"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* User Type Badge */}
      <View style={styles.userTypeBadge}>
        <Text style={styles.userTypeText}>
          {userType.charAt(0).toUpperCase() + userType.slice(1)} Mode
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  skipButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#dbc600',
    width: 24,
  },
  progressDotCompleted: {
    backgroundColor: 'white',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  stepIcon: {
    fontSize: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  featuresContainer: {
    width: '100%',
    maxWidth: 300,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  featureText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 10,
    fontWeight: '500',
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#dbc600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  userTypeBadge: {
    position: 'absolute',
    top: 50,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
  },
  userTypeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoIcon: {
    fontSize: 80,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingIndicator: {
    width: '80%',
    alignItems: 'center',
  },
  loadingBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 20,
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#dbc600',
    borderRadius: 2,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
  },
});
