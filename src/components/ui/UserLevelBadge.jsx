import React from 'react';
import { FaStar, FaUserShield, FaUser } from 'react-icons/fa';

const UserLevelBadge = ({ level, size = 'sm' }) => {
  const levelConfig = {
    'básico': {
      label: 'Básico',
      icon: FaUser,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-300'
    },
    'intermedio': {
      label: 'Intermedio',
      icon: FaStar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300'
    },
    'avanzado': {
      label: 'Avanzado',
      icon: FaStar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300'
    },
    'administrador': {
      label: 'Admin',
      icon: FaUserShield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-300'
    }
  };

  const config = levelConfig[level] || levelConfig['básico'];
  const IconComponent = config.icon;

  const sizeClasses = {
    'xs': 'text-xs px-2 py-1',
    'sm': 'text-sm px-2 py-1',
    'md': 'text-base px-3 py-2',
    'lg': 'text-lg px-4 py-2'
  };

  return (
    <span className={`
      inline-flex items-center gap-1 rounded-full font-medium border
      ${config.color} ${config.bgColor} ${config.borderColor} ${sizeClasses[size]}
    `}>
      <IconComponent className="w-3 h-3" />
      {config.label}
    </span>
  );
};

export default UserLevelBadge;
