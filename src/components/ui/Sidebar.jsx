import React from 'react';
import SermonSaveButton from '../sermon/SermonSaveButton';

const Sidebar = ({ modo, setModo, onClearSermon, onSave, isSaving, lastSaved }) => {
  const modes = [
    { id: 'edicion', name: 'Modo Edición' },
    { id: 'estudio', name: 'Modo Estudio' },
    { id: 'predicacion', name: 'Modo Predicación' },
  ];

  return (
    <div className="flex justify-between items-center p-4 bg-gray-200 shadow-md">
      <div className="flex gap-4">
        {modes.map((m) => (
          <button
            key={m.id}
            className={`px-4 py-2 rounded-md text-sm font-medium 
              ${modo === m.id ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}
            `}
            onClick={() => setModo(m.id)}
          >
            {m.name}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onClearSermon}
          className="px-4 py-2 rounded-md text-sm font-medium bg-red-500 text-white hover:bg-red-600"
        >
          Limpiar
        </button>
        <SermonSaveButton onSave={onSave} isSaving={isSaving} lastSaved={lastSaved} />
      </div>
    </div>
  );
};

export default Sidebar;