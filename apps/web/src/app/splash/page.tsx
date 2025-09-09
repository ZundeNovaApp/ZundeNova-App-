"use client";

import React from 'react';
import WebSplashScreen from '../../components/WebSplashScreen';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();

  const handleComplete = () => {
    localStorage.setItem('zundenova_has_seen_splash', 'true');
    localStorage.setItem('zundenova_last_splash_date', new Date().toDateString());
    
    router.push('/');
  };

  return (
    <WebSplashScreen 
      onComplete={handleComplete}
      userRole="farmer"
    />
  );
}
