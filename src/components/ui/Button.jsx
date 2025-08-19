/**
 * @fileoverview Componente de botón reutilizable
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Botón estilizado para acciones principales en la app.
 *
 * @usage
 * <Button onClick={...}>Texto</Button>
 */
import React from 'react';

const Button = ({ children, onClick, type = 'button', style = {} }) => (
  <button type={type} onClick={onClick} style={{ padding: '8px 16px', borderRadius: '4px', background: '#1976d2', color: '#fff', border: 'none', ...style }}>
    {children}
  </button>
);

export default Button;
