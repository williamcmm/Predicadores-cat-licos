/**
 * @fileoverview Componente Modal reutilizable
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Muestra un modal centrado para mensajes o formularios.
 *
 * @usage
 * <Modal open={true} onClose={...}>Contenido</Modal>
 */
import React from 'react';

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', minWidth: '300px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>×</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
