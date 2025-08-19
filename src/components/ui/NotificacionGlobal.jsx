/**
 * @fileoverview Componente global de notificaciones
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Muestra mensajes de éxito, error o información en la app.
 *
 * @usage
 * <NotificacionGlobal mensaje={mensaje} tipo={tipo} onClose={fn} />
 */
import React from 'react';

const colores = {
  exito: '#43a047',
  error: '#e53935',
  info: '#1976d2'
};

const NotificacionGlobal = ({ mensaje, tipo = 'info', onClose }) => {
  if (!mensaje) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 24,
      right: 24,
      background: colores[tipo] || colores.info,
      color: '#fff',
      padding: '16px 32px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px #0007',
      zIndex: 3000
    }}>
      <span>{mensaje}</span>
      <button style={{marginLeft:'18px',background:'none',color:'#fff',border:'none',fontWeight:'bold',cursor:'pointer'}} onClick={onClose}>X</button>
    </div>
  );
};

export default NotificacionGlobal;
