import React from 'react';
import { motion } from 'framer-motion';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
  className?: string;
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  name, 
  size = 'md', 
  online = false, 
  className = '', 
  onClick 
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const baseClasses = `
    relative inline-flex items-center justify-center rounded-full
    ${sizeClasses[size]}
    ${onClick ? 'cursor-pointer hover:scale-105 transition-transform duration-200' : ''}
    ${className}
  `;

  return (
    <motion.div
      className={baseClasses}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
          {getInitials(name)}
        </div>
      )}
      
      {online && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
      )}
    </motion.div>
  );
};

export default Avatar;