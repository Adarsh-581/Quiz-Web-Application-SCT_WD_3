import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false, 
  onClick 
}) => {
  const baseClasses = `
    bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 
    shadow-sm transition-all duration-200
    ${hover ? 'hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  return (
    <motion.div
      className={baseClasses}
      onClick={onClick}
      whileHover={hover ? { y: -2, scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export default Card;