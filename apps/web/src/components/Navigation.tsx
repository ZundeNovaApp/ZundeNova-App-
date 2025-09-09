'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    role: string;
    avatar?: string;
  } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/diagnostics', label: 'AI Diagnostics', icon: '🔬' },
    { href: '/ndvi', label: 'Field Analysis', icon: '🛰️' },
    { href: '/ai-chat', label: 'AI Assistant', icon: '🤖' },
    { href: '/marketplace', label: 'Marketplace', icon: '🛒' },
    { href: '/farms', label: 'My Farms', icon: '🌾' },
    { href: '/analytics', label: 'Analytics', icon: '📊' },
    { href: '/consult', label: 'Expert Consult', icon: '👨‍⚕️' },
    { href: '/ngo', label: 'NGO Dashboard', icon: '🏛️' },
    { href: '/coop', label: 'Cooperative', icon: '🤝' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  if (pathname.startsWith('/auth/')) {
    return null;
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <img 
              src="/zundenova-logo.png" 
              alt="ZundeNova Logo" 
              className="h-10 w-10"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-xl font-bold" style={{color: '#00684b'}}>
              ZundeNova
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                style={isActive(item.href) ? {backgroundColor: '#00684b'} : {}}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            
            {user ? (
              <div className="ml-4 flex items-center space-x-3">
                <div className="relative group">
                  <button className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center">
                    {user.name} ▼
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      👤 Profile
                    </Link>
                    <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      ⚙️ Settings
                    </Link>
                    <Link href="/analytics" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      📊 Analytics
                    </Link>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="ml-4 flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-sm text-white px-3 py-1 rounded-md font-medium hover:opacity-90"
                  style={{backgroundColor: '#00684b'}}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  style={isActive(item.href) ? {backgroundColor: '#00684b'} : {}}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
