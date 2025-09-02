import React, { useState } from 'react';
import { useAccessControl } from '../../hooks/useAccessControl';
import MiBiblioteca from './MiBiblioteca';
import SermonDelDia from './SermonDelDia';
import SermonesCMM from './SermonesCMM';

const Biblioteca = ({ onClose, onOpenSermon }) => {
  const [activeView, setActiveView] = useState('sermon_de_hoy');
  const { hasAccess, getAccessMessage } = useAccessControl();

  const handleNavClick = (view) => {
    let canAccess = true;
    if (view === 'mis_sermones' && !hasAccess.personalLibrary) {
      alert(getAccessMessage('personalLibrary') + ' ¡Actualiza tu plan para desbloquearlo!');
      canAccess = false;
    }
    if (view === 'sermones_cmm' && !hasAccess.sermonesCMM) {
      alert(getAccessMessage('sermonesCMM') + ' ¡Actualiza tu plan para desbloquearlo!');
      canAccess = false;
    }

    if (canAccess) {
      setActiveView(view);
    }
  };

  const getButtonClass = (view) => {
    return `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      activeView === view
        ? 'bg-purple-600 text-white'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full md:w-3/4 lg:w-2/3 h-5/6 p-6 flex flex-col">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">Biblioteca</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex space-x-2 mb-4 border-b pb-4">
          <button onClick={() => handleNavClick('sermon_de_hoy')} className={getButtonClass('sermon_de_hoy')}>
            Sermón de Hoy
          </button>
          <button 
            onClick={() => handleNavClick('mis_sermones')} 
            className={getButtonClass('mis_sermones')}
            disabled={!hasAccess.personalLibrary}
          >
            Mis Sermones
          </button>
          <button 
            onClick={() => handleNavClick('sermones_cmm')} 
            className={getButtonClass('sermones_cmm')}
            disabled={!hasAccess.sermonesCMM}
          >
            Sermones CMM
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto">
          {activeView === 'sermon_de_hoy' && <SermonDelDia />}
          {activeView === 'mis_sermones' && <MiBiblioteca onClose={onClose} onOpenSermon={onOpenSermon} isSubView={true} />}
          {activeView === 'sermones_cmm' && <SermonesCMM />}
        </div>
      </div>
    </div>
  );
};

export default Biblioteca;
