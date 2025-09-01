import React from 'react';
import { useAuth } from '../../context/AuthContext';

const UserLevel = () => {
  const { currentUser, membershipLevel } = useAuth();

  if (!currentUser) return null;

  const getLevelInfo = (level) => {
    switch (level) {
      case 0:
        return {
          name: 'Visitante',
          color: 'text-gray-700',
          bgColor: 'bg-white/20',
          shortName: 'V'
        };
      case 1:
        return {
          name: 'Miembro Nivel 1',
          color: 'text-blue-700',
          bgColor: 'bg-blue-100',
          shortName: 'N1'
        };
      case 2:
        return {
          name: 'Miembro Nivel 2',
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          shortName: 'N2'
        };
      case 3:
        return {
          name: 'Miembro Nivel 3',
          color: 'text-purple-700',
          bgColor: 'bg-purple-100',
          shortName: 'N3'
        };
      default:
        return getLevelInfo(0);
    }
  };

  const levelInfo = getLevelInfo(membershipLevel);

  return (
    <div 
      className={`px-2 py-1 rounded text-xs font-medium ${levelInfo.bgColor} ${levelInfo.color} cursor-pointer`}
      title={levelInfo.name}
    >
      {levelInfo.shortName}
    </div>
  );
};

export default UserLevel;
