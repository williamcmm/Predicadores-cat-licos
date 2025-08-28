import React from 'react';

const SermonSaveButton = ({ onSave, isSaving, lastSaved, className = '' }) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onSave}
        className={`font-medium text-white transition-colors
          ${className} 
          ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}
        `}
        disabled={isSaving}
      >
        {isSaving ? 'Guardando...' : 'Guardar'}
      </button>
      {lastSaved && (
        <span className="text-gray-500 text-xs hidden sm:inline">
          Último guardado: {new Date(lastSaved).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default SermonSaveButton;
