import React, { useState } from 'react';
import SermonTitleEditor from './sermon/SermonTitleEditor';
import SermonIntroductionEditor from './sermon/SermonIntroductionEditor';
import SermonIdeaEditor from './sermon/SermonIdeaEditor';
import SermonImperativesEditor from './sermon/SermonImperativesEditor';
import SermonConclusionEditor from './sermon/SermonConclusionEditor';
import PredicacionFullScreen from './sermon/PredicacionFullScreen';
import ModoEstudio from './sermon/ModoEstudio'; // Importar el nuevo componente

export default function SermonBuilder({ sermon, onSermonChange, onAddIdea, onRemoveIdea }) {
  const [mode, setMode] = useState('editing'); // 'editing', 'study', or 'preaching'

  if (!sermon) {
    return <div>Cargando sermón...</div>;
  }

  if (mode === 'preaching') {
    return <PredicacionFullScreen sermon={sermon} onClose={() => setMode('editing')} />;
  }

  if (mode === 'study') {
    return <ModoEstudio sermon={sermon} onClose={() => setMode('editing')} />;
  }

  // Common button style
  const btnStyle = (isActive) => ({
    padding: '8px 16px',
    borderRadius: '6px',
    border: `1px solid ${isActive ? 'transparent' : '#ccc'}`,
    background: isActive ? '#4285F4' : 'white',
    color: isActive ? 'white' : '#333',
    cursor: 'pointer',
    fontWeight: 'bold'
  });

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
        <h2 style={{ margin: '0 16px 10px 0' }}>Preparador de Sermones</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setMode('editing')} style={btnStyle(mode === 'editing')}>Modo Edición</button>
          <button onClick={() => setMode('study')} style={{...btnStyle(mode === 'study'), background: mode==='study' ? '#fbbc05' : 'white', color: mode==='study' ? 'white' : '#333'}}>Modo Estudio</button>
          <button onClick={() => setMode('preaching')} style={{...btnStyle(mode === 'preaching'), background: mode==='preaching' ? '#34A853' : 'white', color: mode==='preaching' ? 'white' : '#333'}}>Modo Predicación</button>
        </div>
      </div>
      
      <SermonTitleEditor 
        titulo={sermon.titulo} 
        onChange={(val) => onSermonChange('titulo', val)} 
      />
      
      <SermonIntroductionEditor 
        introduccion={sermon.introduccion} 
        onChange={onSermonChange} 
      />

      {sermon.ideas.map((idea, index) => (
        <SermonIdeaEditor 
          key={index} // Changed from idea.id to index to prevent crash with new data structure
          idea={idea} 
          onChange={onSermonChange}
          onRemove={() => onRemoveIdea(idea.id)} // This might need adjustment if id is not present
          index={index}
        />
      ))}

      <button onClick={onAddIdea} style={{marginBottom: '16px'}}>Añadir Idea Principal</button>

      <SermonImperativesEditor 
        imperativos={sermon.imperativos} 
        onChange={(val) => onSermonChange('imperativos', val)}
      />

      <SermonConclusionEditor 
        conclusion={sermon.conclusion} 
        onChange={onSermonChange}
      />

    </div>
  );
}
