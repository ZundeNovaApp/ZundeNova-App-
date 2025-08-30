export type UserRole = 'FARMER' | 'VET' | 'PARTNER' | 'NGO' | 'INVESTOR' | 'ADMIN' | 'AGRO_DEALER' | 'EXPERT';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  profileImage?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FarmerProfile extends User {
  role: 'FARMER';
  farmId?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  preferredLanguage: string;
}

export interface ExpertProfile extends User {
  role: 'VET' | 'EXPERT';
  specialization: string[];
  licenseNumber?: string;
  experience: number;
  rating: number;
  isAvailable: boolean;
}
