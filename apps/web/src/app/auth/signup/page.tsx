'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'FARMER'
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string[]> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = ['Name is required'];
    }
    
    if (!formData.email) {
      newErrors.email = ['Email is required'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = ['Please enter a valid email address'];
    }
    
    if (!formData.phone) {
      newErrors.phone = ['Phone number is required'];
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = ['Please enter a valid phone number'];
    }
    
    if (!formData.password) {
      newErrors.password = ['Password is required'];
    } else {
      if (formData.password.length < 8) {
        newErrors.password = ['Password must be at least 8 characters long'];
      }
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = ['Passwords do not match'];
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        setSignupError(errorData.message || 'Registration failed');
      }
    } catch {
      setSignupError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: [] }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img 
            src="/zundenova-logo.png" 
            alt="ZundeNova Logo" 
            className="mx-auto h-16 w-16"
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Join ZundeNova
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account to start smart farming
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {signupError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {signupError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                  errors.name?.length ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name?.map((error, index) => (
                <p key={index} className="text-sm text-red-600 mt-1">• {error}</p>
              ))}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                  errors.email?.length ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                }`}
                placeholder="Enter your email"
              />
              {errors.email?.map((error, index) => (
                <p key={index} className="text-sm text-red-600 mt-1">• {error}</p>
              ))}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                  errors.phone?.length ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                }`}
                placeholder="Enter your phone number"
              />
              {errors.phone?.map((error, index) => (
                <p key={index} className="text-sm text-red-600 mt-1">• {error}</p>
              ))}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                I am a...
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="FARMER">Farmer</option>
                <option value="VET">Veterinarian</option>
                <option value="DEALER">Agro-dealer</option>
                <option value="NGO">NGO Representative</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                  errors.password?.length ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                }`}
                placeholder="Create a strong password"
              />
              {errors.password?.map((error, index) => (
                <p key={index} className="text-sm text-red-600 mt-1">• {error}</p>
              ))}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                  errors.confirmPassword?.length ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                }`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword?.map((error, index) => (
                <p key={index} className="text-sm text-red-600 mt-1">• {error}</p>
              ))}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all"
              style={{ backgroundColor: '#00684b' }}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/auth/login" className="font-medium text-green-600 hover:text-green-500">
                Sign in here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
