/**
 * @fileoverview Componente Loader para mostrar carga
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Muestra un spinner de carga para procesos asíncronos.
 *
 * @usage
 * <Loader />
 */
import React from 'react';

const Loader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40px' }}>
    <div style={{ border: '4px solid #eee', borderTop: '4px solid #1976d2', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default Loader;
