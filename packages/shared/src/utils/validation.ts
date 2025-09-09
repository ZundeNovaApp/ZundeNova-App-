export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please enter a valid email address');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePhone = (phone: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!phone) {
    errors.push('Phone number is required');
  } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(phone)) {
    errors.push('Please enter a valid phone number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!value || value.trim().length === 0) {
    errors.push(`${fieldName} is required`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateImageFile = (file: File): ValidationResult => {
  const errors: string[] = [];
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!file) {
    errors.push('Please select an image file');
  } else {
    if (!allowedTypes.includes(file.type)) {
      errors.push('Please select a valid image file (JPEG, PNG, or WebP)');
    }
    if (file.size > maxSize) {
      errors.push('Image file size must be less than 10MB');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};

export const validateFieldId = (fieldId: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!fieldId) {
    errors.push('Field ID is required');
  } else if (!/^[a-zA-Z0-9_-]+$/.test(fieldId)) {
    errors.push('Field ID can only contain letters, numbers, hyphens, and underscores');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateBoundingBox = (bbox: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!bbox) {
    errors.push('Bounding box is required');
  } else {
    const coords = bbox.split(',').map(coord => parseFloat(coord.trim()));
    if (coords.length !== 4) {
      errors.push('Bounding box must contain exactly 4 coordinates');
    } else if (coords.some(coord => isNaN(coord))) {
      errors.push('All bounding box coordinates must be valid numbers');
    } else {
      const [minLon, minLat, maxLon, maxLat] = coords;
      if (minLon >= maxLon) {
        errors.push('Maximum longitude must be greater than minimum longitude');
      }
      if (minLat >= maxLat) {
        errors.push('Maximum latitude must be greater than minimum latitude');
      }
      if (minLon < -180 || maxLon > 180) {
        errors.push('Longitude values must be between -180 and 180');
      }
      if (minLat < -90 || maxLat > 90) {
        errors.push('Latitude values must be between -90 and 90');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
