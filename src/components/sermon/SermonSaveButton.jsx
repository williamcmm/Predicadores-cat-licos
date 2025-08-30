import React, { useState } from 'react';

const SermonSaveButton = ({ onSave, isSaving, lastSaved, className = '' }) => {
  const [saveStatus, setSaveStatus] = useState(null);

  const handleSave = async () => {
    try {
      const result = await onSave();
      if (result && result.success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(null), 5000);
      }
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  const getButtonStyle = () => {
    if (isSaving) return 'bg-yellow-500 cursor-not-allowed';
    if (saveStatus === 'success') return 'bg-green-600 hover:bg-green-700';
    if (saveStatus === 'error') return 'bg-red-500 hover:bg-red-600';
    return 'bg-green-500 hover:bg-green-600';
  };

  const getButtonText = () => {
    if (isSaving) return 'Guardando...';
    if (saveStatus === 'success') return ' Guardado';
    if (saveStatus === 'error') return ' Error';
    return 'Guardar';
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleSave}
        className={`font-medium text-white transition-all duration-300 min-w-[100px] px-4 py-2 rounded ${className} ${getButtonStyle()}`}
        disabled={isSaving}
      >
        {getButtonText()}
      </button>
      {lastSaved && (
        <span className="text-gray-500 text-xs hidden sm:inline">
          Último guardado: {new Date(lastSaved).toLocaleTimeString()}
        </span>
      )}
      {saveStatus === 'error' && (
        <span className="text-red-500 text-xs">
          Error al guardar. Intente nuevamente.
        </span>
      )}
    </div>
  );
};

export default SermonSaveButton;