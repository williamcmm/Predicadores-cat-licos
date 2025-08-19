/**
 * @fileoverview Página para ver las predicaciones del usuario
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Muestra la lista de predicaciones creadas por el usuario.
 *
 * @usage
 * <MisPredicacionesPage />
 */
import React, { useState } from 'react';
import MisPredicacionesList from '../components/feature/MisPredicacionesList';
import PredicacionDetalle from '../components/feature/PredicacionDetalle';

const MisPredicacionesPage = () => {
  const [selectedId, setSelectedId] = useState(null);
  return (
    <div>
      <h2>Mis Predicaciones</h2>
      <p>Aquí verás todas tus predicaciones guardadas.</p>
      {/* Estado para la predicación seleccionada */}
      {selectedId ? (
        <PredicacionDetalle id={selectedId} />
      ) : (
        <MisPredicacionesList onSelect={id => setSelectedId(id)} />
      )}
    </div>
  );
};

export default MisPredicacionesPage;
