/**
 * @fileoverview Listado de predicaciones del usuario
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Muestra las predicaciones guardadas en Firestore.
 *
 * @usage
 * <MisPredicacionesList />
 */
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const MisPredicacionesList = ({ onSelect }) => {
  const [predicaciones, setPredicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('titulo');

  useEffect(() => {
    const fetchPredicaciones = async () => {
      setLoading(true);
      try {
        const colRef = collection(db, 'predicaciones');
        const snapshot = await getDocs(colRef);
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPredicaciones(items);
      } catch (err) {
        setError('Error al cargar las predicaciones');
      } finally {
        setLoading(false);
      }
    };
    fetchPredicaciones();
  }, []);

  if (loading) return <p>Cargando predicaciones...</p>;
  if (error) return <p style={{color: 'red'}}>{error}</p>;
  if (predicaciones.length === 0) return <p>No tienes predicaciones guardadas.</p>;

  // Filtrado
  const predicacionesFiltradas = predicaciones.filter(pred => {
    if (!busqueda.trim()) return true;
    const valor = (pred[filtro] || '').toLowerCase();
    return valor.includes(busqueda.toLowerCase());
  });

  return (
    <div>
      <div style={{marginBottom:'16px'}}>
        <input
          type="text"
          placeholder={`Buscar por ${filtro}`}
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{marginRight:'8px',padding:'6px'}}
        />
        <select value={filtro} onChange={e => setFiltro(e.target.value)} style={{padding:'6px'}}>
          <option value="titulo">Título</option>
          <option value="tema">Tema</option>
          <option value="fecha">Fecha</option>
        </select>
      </div>
      <ul>
        {predicacionesFiltradas.map(pred => (
          <li key={pred.id}>
            <button style={{background:'none',border:'none',color:'#1976d2',cursor:'pointer',textDecoration:'underline'}} onClick={() => onSelect(pred.id)}>
              <strong>{pred.titulo}</strong>
            </button> - {pred.tema} ({pred.audiencia}) [{pred.fecha}]
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MisPredicacionesList;
