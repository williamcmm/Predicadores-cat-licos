/**
 * @fileoverview Componente para cambiar el tamaño de fuente global
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Permite al usuario aumentar o disminuir el tamaño de fuente para accesibilidad.
 *
 * @usage
 * <FontSizeToggle />
 */
import React, { useState, useEffect } from 'react';

const FontSizeToggle = () => {
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    document.body.style.fontSize = fontSize + 'px';
  }, [fontSize]);

  return (
    <div style={{margin:'8px 0'}}>
      <button onClick={() => setFontSize(f => Math.max(12, f - 2))} style={{marginRight:'8px'}}>A-</button>
      <button onClick={() => setFontSize(f => Math.min(32, f + 2))}>A+</button>
      <span style={{marginLeft:'12px'}}>Tamaño actual: {fontSize}px</span>
    </div>
  );
};

export default FontSizeToggle;
