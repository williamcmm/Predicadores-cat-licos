/**
 * @fileoverview Componente para mostrar disparadores mentales con tooltip expandible
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Muestra una frase clave y al pasar el mouse o tocar, expande el contenido completo.
 *
 * @usage
 * <DisparadorTooltip frase="Amar es sacrificio" contenido="Explicación completa sobre el amor cristiano..." />
 */
import React, { useState } from 'react';

const DisparadorTooltip = ({ frase, contenido }) => {
  const [visible, setVisible] = useState(false);

  return (
    <span style={{position:'relative',cursor:'pointer',color:'#1976d2'}}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onClick={() => setVisible(v => !v)}
    >
      {frase}
      {visible && (
        <div style={{position:'absolute',top:'120%',left:0,background:'#fff',color:'#222',border:'1px solid #ccc',padding:'12px',borderRadius:'6px',minWidth:'220px',zIndex:100}}>
          {contenido}
        </div>
      )}
    </span>
  );
};

export default DisparadorTooltip;
