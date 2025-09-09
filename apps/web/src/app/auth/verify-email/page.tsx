'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState('');
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      verifyEmail(tokenParam);
    } else {
      setMessage('Invalid or missing verification token.');
      setIsLoading(false);
    }
  }, [searchParams]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Email verified successfully! Your account is now active.');
        setIsSuccess(true);
      } else {
        setMessage(data.error || 'Email verification failed. The token may be invalid or expired.');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Network error. Please check your connection and try again.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl font-bold">Z</span>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLoading ? 'Verifying your email address...' : 'Verification complete'}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`text-center text-sm p-4 rounded-md ${
              isSuccess 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <div className="flex items-center justify-center mb-2">
                {isSuccess ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              {message}
            </div>

            <div className="text-center space-y-4">
              {isSuccess ? (
                <div className="space-y-2">
                  <Link 
                    href="/auth/login" 
                    className="inline-block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
                  >
                    Continue to Login
                  </Link>
                  <Link 
                    href="/" 
                    className="inline-block text-green-600 hover:text-green-500 text-sm font-medium transition-colors duration-200"
                  >
                    Go to Homepage
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link 
                    href="/auth/signup" 
                    className="inline-block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
                  >
                    Sign Up Again
                  </Link>
                  <Link 
                    href="/auth/login" 
                    className="inline-block text-green-600 hover:text-green-500 text-sm font-medium transition-colors duration-200"
                  >
                    Back to Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Having trouble? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
