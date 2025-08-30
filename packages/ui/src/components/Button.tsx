import React from 'react';
import { ZundeNovaColors } from '../theme/colors';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: `bg-[${ZundeNovaColors.primary.green}] text-white hover:bg-green-700 focus:ring-green-500`,
    secondary: `bg-[${ZundeNovaColors.primary.gold}] text-gray-900 hover:bg-yellow-400 focus:ring-yellow-500`,
    outline: `border-2 border-[${ZundeNovaColors.primary.green}] text-[${ZundeNovaColors.primary.green}] hover:bg-[${ZundeNovaColors.primary.green}] hover:text-white focus:ring-green-500`
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
