/**
 * @fileoverview Componente para mostrar y guardar recursos favoritos
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Permite al usuario marcar recursos católicos como favoritos y guardarlos en Firestore.
 *
 * @usage
 * <RecursosFavoritos userId={userId} />
 */
import React, { useEffect, useState } from 'react';
import { getDocumentById } from '../../services/database/firestoreService';

const RecursosFavoritos = ({ userId }) => {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoritos = async () => {
      setLoading(true);
      try {
        const data = await getDocumentById('usuarios', userId);
        setFavoritos(data?.favoritos || []);
      } catch {
        setFavoritos([]);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchFavoritos();
  }, [userId]);


  return (
    <div style={{marginTop:'24px'}}>
      <h4>Recursos Favoritos</h4>
      {loading ? <p>Cargando...</p> : (
        <ul>
          {favoritos.map((r,i) => <li key={i}>{r.fuente}: {r.texto}</li>)}
        </ul>
      )}
    </div>
  );
};

export default RecursosFavoritos;
