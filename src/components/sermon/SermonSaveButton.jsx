import React from 'react';

const SermonSaveButton = ({ onSave, isSaving, lastSaved }) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onSave}
        className={`px-4 py-2 rounded-md text-white 
          ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}
        `}
        disabled={isSaving}
      >
        {isSaving ? 'Guardando...' : 'Guardar'}
      </button>
      {lastSaved && (
        <span className="text-gray-600 text-sm">
          Último guardado: {new Date(lastSaved).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default SermonSaveButton;