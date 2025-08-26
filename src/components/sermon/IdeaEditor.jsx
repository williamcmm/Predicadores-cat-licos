import React from 'react';
export default function IdeaEditor({ ideas, setIdeas }) {
  const [nuevaIdea, setNuevaIdea] = React.useState('');

  const agregarIdea = () => {
    if (nuevaIdea.trim()) {
      setIdeas([...ideas, nuevaIdea]);
      setNuevaIdea('');
    }
  };

  return (
    <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px' }}>
      <h3 style={{ color: '#fff', fontWeight: 'bold', marginBottom: '1rem' }}>Ideas del Sermón</h3>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={nuevaIdea}
          onChange={e => setNuevaIdea(e.target.value)}
          placeholder="Agregar nueva idea..."
          style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none' }}
        />
        <button onClick={agregarIdea} style={{ padding: '0.5rem 1.5rem', borderRadius: '6px', background: '#6366f1', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
          Añadir
        </button>
      </div>
      <ul style={{ color: '#fff', paddingLeft: '1rem' }}>
        {ideas.map((idea, idx) => (
          <li key={idx} style={{ marginBottom: '0.5rem' }}>• {idea}</li>
        ))}
      </ul>
    </div>
  );
}
