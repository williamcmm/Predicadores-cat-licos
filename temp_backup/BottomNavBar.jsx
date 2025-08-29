import React from 'react';
import { FaPen, FaBook } from 'react-icons/fa';

const BottomNavBar = ({ activePanel, setActivePanel }) => {
  const buttonClass = (panelName) =>
    `flex flex-col items-center justify-center w-full pt-2 pb-1 ${
      activePanel === panelName ? 'text-blue-600' : 'text-gray-500'
    }`;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
      <button onClick={() => setActivePanel('editor')} className={buttonClass('editor')}>
        <FaPen className="h-6 w-6" />
        <span className="text-xs mt-1">Editor</span>
      </button>
      <button onClick={() => setActivePanel('resources')} className={buttonClass('resources')}>
        <FaBook className="h-6 w-6" />
        <span className="text-xs mt-1">Recursos</span>
      </button>
    </div>
  );
};

export default BottomNavBar;
