import React, { useState } from 'react';

// Componente PanelResizer
const PanelResizer = ({ left, right }) => {
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = React.useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    setLeftWidth(Math.max(20, Math.min(80, newLeftWidth)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        display: 'flex', 
        height: '100%', 
        width: '100%',
        cursor: isDragging ? 'col-resize' : 'default'
      }}
    >
      <div style={{ width: `${leftWidth}%`, minWidth: '300px' }}>
        {left}
      </div>
      <div
        style={{
          width: '8px',
          background: '#e0e4e7',
          cursor: 'col-resize',
          borderLeft: '1px solid #d1d9e0',
          borderRight: '1px solid #d1d9e0',
          position: 'relative'
        }}
        onMouseDown={handleMouseDown}
      >
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '3px',
          height: '30px',
          background: '#8892b0',
          borderRadius: '2px'
        }} />
      </div>
      <div style={{ width: `${100 - leftWidth}%`, minWidth: '300px' }}>
        {right}
      </div>
    </div>
  );
};

// Componente SermonBuilder
import SermonBuilder from './components/SermonBuilder';
import GeminiBuscador from './components/GeminiBuscador';

// Componente Principal App
function App() {
  // Eliminado: resultadosBuscador, setResultadosBuscador no usados

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#f4f6fb', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '1.2rem 0 1rem 0', marginBottom: '0', boxShadow: '0 2px 12px rgba(66,133,244,0.08)', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ margin: 0, fontSize: '2.1rem', fontWeight: 'bold', letterSpacing: '1px' }}>El Predicador Católico</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {['Preparar sermón', 'Sermones preparados', 'Configuración', 'Login'].map(texto => (
              <button key={texto} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.3)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.98rem', fontWeight: 'bold', transition: 'background 0.2s' }}>{texto}</button>
            ))}
          </div>
        </div>
      </header>
      {/* Layout Principal con PanelResizer: Izquierda (SermonBuilder) | Derecha (Resultados Gemini) */}
      <div style={{ flex: '1 1 auto', display: 'flex', minHeight: 0, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 24px 24px 24px', boxSizing: 'border-box' }}>
        <PanelResizer
          left={
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <SermonBuilder />
            </div>
          }
          right={
            <div style={{ height: '100%', background: 'white', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <GeminiBuscador titulo="Buscar temas y recursos para predicación" />
            </div>
          }
        />
      </div>
    </div>
  );
}

export default App;
// ...existing code...