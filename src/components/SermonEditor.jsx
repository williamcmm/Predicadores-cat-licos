import React, { useState, useEffect } from 'react';
import { useAppContext } from '../store/AppContext';

const SermonEditor = ({ canSave, title, onTitleChange, inputStyle }) => {
  const [showWarning, setShowWarning] = useState(false);
  useAppContext();

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!canSave && title) {
        e.preventDefault();
        e.returnValue = '';
        setShowWarning(true);
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [canSave, title]);

  const handleSave = () => {
    if (!canSave) {
      setShowWarning(true);
      return;
    }
    // Aquí iría la lógica de guardado real
    alert('Sermón guardado correctamente');
  };

  return (
    <div style={{padding: 24}}>
      <input
        type="text"
        placeholder="Título del sermón"
        value={title}
        onChange={e => onTitleChange(e.target.value)}
        style={inputStyle ? {...inputStyle, marginBottom:16} : {width: '80%', marginBottom: 16, padding: 8}}
      />
      <button style={{marginBottom: 16}}>Agregar H1</button>
      {/* Aquí iría el editor de H1 y bullets */}
      <button style={{background: '#4285f4', color: '#fff', padding: '8px 16px'}} onClick={handleSave}>Predicar</button>
      {showWarning && (
        <div style={{marginTop:16,background:'#fff3cd',color:'#856404',padding:'12px',borderRadius:'8px',boxShadow:'0 2px 8px rgba(66,133,244,0.12)'}}>
          <strong>Para guardar los cambios debes iniciar sesión con tu cuenta de Gmail.</strong><br />
          Si cierras la página en este momento se perderán tus cambios.
        </div>
      )}
    </div>
  );
};

export default SermonEditor;
