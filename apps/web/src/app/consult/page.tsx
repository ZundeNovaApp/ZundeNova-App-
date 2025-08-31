'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@zundenova/ui';

interface Expert {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  experience: number;
  languages: string[];
  hourlyRate: number;
  currency: string;
  availability: 'available' | 'busy' | 'offline';
  profileImage: string;
  bio: string;
}

interface Appointment {
  id: string;
  expertId: string;
  expertName: string;
  date: string;
  time: string;
  duration: number;
  type: 'video' | 'chat' | 'phone';
  status: 'scheduled' | 'completed' | 'cancelled';
  topic: string;
}

export default function ExpertConsult() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const specialties = [
    { id: 'all', name: 'All Specialties' },
    { id: 'veterinary', name: 'Veterinary Medicine' },
    { id: 'agronomy', name: 'Crop Science' },
    { id: 'livestock', name: 'Livestock Management' },
    { id: 'soil', name: 'Soil Science' },
    { id: 'pest', name: 'Pest Management' },
    { id: 'nutrition', name: 'Animal Nutrition' }
  ];

  useEffect(() => {
    fetchExperts();
    fetchAppointments();
  }, []);

  const fetchExperts = async () => {
    try {
      const mockExperts: Expert[] = [
        {
          id: '1',
          name: 'Dr. Sarah Mwangi',
          specialty: 'veterinary',
          rating: 4.9,
          reviews: 156,
          experience: 12,
          languages: ['English', 'Swahili'],
          hourlyRate: 75,
          currency: 'USD',
          availability: 'available',
          profileImage: '/api/placeholder/150/150',
          bio: 'Experienced veterinarian specializing in livestock health and disease prevention in East Africa.'
        },
        {
          id: '2',
          name: 'Prof. James Ochieng',
          specialty: 'agronomy',
          rating: 4.8,
          reviews: 203,
          experience: 18,
          languages: ['English', 'Swahili', 'Luo'],
          hourlyRate: 85,
          currency: 'USD',
          availability: 'available',
          profileImage: '/api/placeholder/150/150',
          bio: 'Agricultural scientist with expertise in crop production, soil management, and sustainable farming practices.'
        },
        {
          id: '3',
          name: 'Dr. Amina Hassan',
          specialty: 'livestock',
          rating: 4.7,
          reviews: 89,
          experience: 8,
          languages: ['English', 'Arabic', 'Swahili'],
          hourlyRate: 65,
          currency: 'USD',
          availability: 'busy',
          profileImage: '/api/placeholder/150/150',
          bio: 'Livestock management specialist focusing on dairy farming and animal breeding programs.'
        },
        {
          id: '4',
          name: 'Dr. Peter Kimani',
          specialty: 'pest',
          rating: 4.6,
          reviews: 134,
          experience: 15,
          languages: ['English', 'Kikuyu'],
          hourlyRate: 70,
          currency: 'USD',
          availability: 'available',
          profileImage: '/api/placeholder/150/150',
          bio: 'Entomologist and pest management expert with focus on integrated pest management solutions.'
        }
      ];

      setExperts(mockExperts);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch experts:', error);
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          expertId: '1',
          expertName: 'Dr. Sarah Mwangi',
          date: '2025-09-02',
          time: '14:00',
          duration: 60,
          type: 'video',
          status: 'scheduled',
          topic: 'Cattle vaccination schedule'
        },
        {
          id: '2',
          expertId: '2',
          expertName: 'Prof. James Ochieng',
          date: '2025-08-28',
          time: '10:30',
          duration: 45,
          type: 'chat',
          status: 'completed',
          topic: 'Maize crop disease identification'
        }
      ];

      setAppointments(mockAppointments);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  const bookAppointment = (expert: Expert) => {
    setSelectedExpert(expert);
    setShowBookingModal(true);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredExperts = experts.filter(expert => 
    selectedSpecialty === 'all' || expert.specialty === selectedSpecialty
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading experts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Expert Consultation</h1>
            </div>
            <nav className="flex space-x-6">
              <a href="/dashboard" className="text-gray-600 hover:text-green-600">Dashboard</a>
              <a href="/marketplace" className="text-gray-600 hover:text-green-600">Marketplace</a>
              <a href="/farms" className="text-gray-600 hover:text-green-600">My Farms</a>
              <a href="/consult" className="text-green-600 font-medium">Expert Consult</a>
              <a href="/ai-chat" className="text-gray-600 hover:text-green-600">AI Assistant</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Specialty</h3>
              <div className="space-y-2">
                {specialties.map((specialty) => (
                  <button
                    key={specialty.id}
                    onClick={() => setSelectedSpecialty(specialty.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedSpecialty === specialty.id
                        ? 'bg-green-100 text-green-800 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {specialty.name}
                  </button>
                ))}
              </div>
            </Card>

            {/* Upcoming Appointments */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
              <div className="space-y-4">
                {appointments.filter(apt => apt.status === 'scheduled').map((appointment) => (
                  <div key={appointment.id} className="border-l-4 border-green-500 pl-4">
                    <p className="font-medium text-gray-900">{appointment.expertName}</p>
                    <p className="text-sm text-gray-600">{appointment.topic}</p>
                    <p className="text-sm text-gray-500">
                      {appointment.date} at {appointment.time}
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{appointment.type}</span>
                    </div>
                  </div>
                ))}
                {appointments.filter(apt => apt.status === 'scheduled').length === 0 && (
                  <p className="text-gray-500 text-sm">No upcoming appointments</p>
                )}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Available Experts</h2>
              <p className="text-gray-600">Connect with agricultural and veterinary experts for professional advice.</p>
            </div>

            {/* Experts Grid */}
            <div className="space-y-6">
              {filteredExperts.map((expert) => (
                <Card key={expert.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">Photo</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{expert.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(expert.availability)}`}>
                          {expert.availability.charAt(0).toUpperCase() + expert.availability.slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(expert.rating) ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="ml-2 text-sm text-gray-600">
                            {expert.rating} ({expert.reviews} reviews)
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-3">{expert.bio}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{expert.experience} years experience</span>
                          <span>Languages: {expert.languages.join(', ')}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              ${expert.hourlyRate}/{expert.currency}
                            </p>
                            <p className="text-sm text-gray-600">per hour</p>
                          </div>
                          <button
                            onClick={() => bookAppointment(expert)}
                            disabled={expert.availability !== 'available'}
                            className={`px-6 py-2 rounded-md font-medium transition-colors ${
                              expert.availability === 'available'
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Book Consultation
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {showBookingModal && selectedExpert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Book Consultation with {selectedExpert.name}
            </h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consultation Topic
                </label>
                <input
                  type="text"
                  placeholder="Brief description of your issue"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Time
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>09:00 AM</option>
                  <option>10:00 AM</option>
                  <option>11:00 AM</option>
                  <option>02:00 PM</option>
                  <option>03:00 PM</option>
                  <option>04:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consultation Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="video">Video Call</option>
                  <option value="chat">Text Chat</option>
                  <option value="phone">Phone Call</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
