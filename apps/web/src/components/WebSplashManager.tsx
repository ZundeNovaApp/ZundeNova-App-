"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface WebSplashManagerProps {
  children: React.ReactNode;
}

export default function WebSplashManager({ children }: WebSplashManagerProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/splash') return;
    
    checkSplashStatus();
  }, [pathname, router]);

  const checkSplashStatus = () => {
    try {
      const hasSeenSplash = localStorage.getItem('zundenova_has_seen_splash');
      const lastSplashDate = localStorage.getItem('zundenova_last_splash_date');
      const today = new Date().toDateString();
      
      if (!hasSeenSplash || lastSplashDate !== today) {
        router.push('/splash');
      }
    } catch (error) {
      console.error('Error checking splash status:', error);
      router.push('/splash');
    }
  };

  return <>{children}</>;
}
