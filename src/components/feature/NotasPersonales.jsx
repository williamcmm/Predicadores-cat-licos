/**
 * @fileoverview Componente para agregar y mostrar notas personales en la predicación
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Permite al predicador agregar notas privadas que no aparecen en el modo presentación.
 *
 * @usage
 * <NotasPersonales notas={[]} onAdd={fn} />
 */
import React, { useState } from 'react';

const NotasPersonales = ({ notas = [], onAdd }) => {
  const [nota, setNota] = useState('');

  const handleAdd = () => {
    if (nota.trim()) {
      onAdd(nota);
      setNota('');
    }
  };

  return (
    <div style={{margin:'16px 0',background:'#f5f5f5',padding:'12px',borderRadius:'6px'}}>
      <h4>Notas Personales</h4>
      <ul>
        {notas.map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ul>
      <input
        type="text"
        value={nota}
        onChange={e => setNota(e.target.value)}
        placeholder="Agregar nota personal"
        style={{width:'80%',marginRight:'8px'}}
      />
      <button onClick={handleAdd}>Agregar</button>
    </div>
  );
};

export default NotasPersonales;
