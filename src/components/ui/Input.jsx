/**
 * @fileoverview Componente de input reutilizable
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Input estilizado para formularios en la app.
 *
 * @usage
 * <Input type="text" value={...} onChange={...} placeholder="..." />
 */
import React from 'react';

const Input = ({ type = 'text', value, onChange, placeholder = '', style = {} }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '8px', ...style }}
  />
);

export default Input;
