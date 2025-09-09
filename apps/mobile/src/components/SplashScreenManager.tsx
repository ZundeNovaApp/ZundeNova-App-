import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InteractiveSplashScreen from './InteractiveSplashScreen';
import OnboardingSplashScreen from './OnboardingSplashScreen';

interface SplashScreenManagerProps {
  onComplete: (userData?: any) => void;
  children: React.ReactNode;
}

export default function SplashScreenManager({ onComplete, children }: SplashScreenManagerProps) {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [userType, setUserType] = useState<'farmer' | 'vet' | 'ngo' | 'coop' | 'investor'>('farmer');

  useEffect(() => {
    checkFirstTimeUser();
  }, []);

  const checkFirstTimeUser = async () => {
    try {
      const hasSeenSplash = await AsyncStorage.getItem('hasSeenSplash');
      const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
      const savedUserType = await AsyncStorage.getItem('userType');
      
      if (savedUserType) {
        setUserType(savedUserType as any);
      }
      
      if (hasSeenSplash && hasCompletedOnboarding) {
        setIsFirstTime(false);
        setShowSplash(false);
      } else if (hasSeenSplash && !hasCompletedOnboarding) {
        setShowSplash(false);
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking first time user:', error);
    }
  };

  const handleSplashComplete = async () => {
    try {
      await AsyncStorage.setItem('hasSeenSplash', 'true');
      setShowSplash(false);
      
      const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      } else {
        onComplete();
      }
    } catch (error) {
      console.error('Error saving splash completion:', error);
      onComplete();
    }
  };

  const handleOnboardingComplete = async (userData: any) => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      await AsyncStorage.setItem('userType', userData.userType);
      await AsyncStorage.setItem('userPreferences', JSON.stringify(userData));
      
      setShowOnboarding(false);
      onComplete(userData);
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
      onComplete(userData);
    }
  };

  if (showSplash) {
    return (
      <InteractiveSplashScreen 
        onComplete={handleSplashComplete}
        userType={userType}
      />
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingSplashScreen 
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return <>{children}</>;
}
