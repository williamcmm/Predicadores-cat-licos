import React, { useState, useEffect } from 'react';

const PanelResizer = ({ left, right }) => {
  const [divider, setDivider] = useState(50);
  const [dragging, setDragging] = useState(false);

  const handleMouseDown = () => setDragging(true);
  const handleMouseUp = () => setDragging(false);
  const handleMouseMove = e => {
    if (!dragging) return;
    const x = e.clientX;
    const width = window.innerWidth;
    // Permitir mover casi hasta el borde (5% a 95%)
    const percent = Math.max(5, Math.min(95, (x / width) * 100));
    setDivider(percent);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  return (
    <div style={{display: 'flex', height: '100vh', width: '100vw'}}>
      <div style={{width: `${divider}%`, minWidth: 0, borderRight: '2px solid #e0e0e0', overflow: 'auto'}}>{left}</div>
      <div style={{width: '6px', cursor: 'col-resize', background: '#cce', zIndex: 2}} onMouseDown={handleMouseDown} />
      <div style={{width: `${100-divider}%`, minWidth: 0, overflow: 'auto'}}>{right}</div>
    </div>
  );
};

export default PanelResizer;
