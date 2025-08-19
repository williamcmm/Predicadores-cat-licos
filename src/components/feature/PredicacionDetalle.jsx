/**
 * @fileoverview Componente para mostrar el detalle de una predicación
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Muestra los datos completos de una predicación seleccionada.
 *
 * @usage
 * <PredicacionDetalle id={predicacionId} />
 */
import React, { useEffect, useState } from 'react';
import { getDocumentById, updateDocumentById, deleteDocumentById } from '../../services/database/firestoreService';
import EditarPredicacionForm from './EditarPredicacionForm';
import ModoPredicacion from './ModoPredicacion';
import NotasPersonales from './NotasPersonales';

const PredicacionDetalle = ({ id }) => {
  const [predicacion, setPredicacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [modoPredicacion, setModoPredicacion] = useState(false);
  const [notas, setNotas] = useState([]);

  useEffect(() => {
    const fetchDetalle = async () => {
      setLoading(true);
      try {
  const data = await getDocumentById('predicaciones', id);
  setPredicacion(data);
  setNotas(data?.notas || []);
      } catch (err) {
        setError('Error al cargar el detalle');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetalle();
  }, [id]);

  if (loading) return <p>Cargando detalle...</p>;
  if (error) return <p style={{color: 'red'}}>{error}</p>;
  if (!predicacion) return <p>No se encontró la predicación.</p>;

  if (modoPredicacion) {
    // Simulación: se usan los puntos sugeridos por IA si existen, si no, solo el tema
    const predicacionPresentar = {
      ...predicacion,
      puntos: predicacion.puntos || [predicacion.tema]
    };
    return <ModoPredicacion predicacion={predicacionPresentar} />;
  }

  return (
    <div>
      {editMode ? (
        <EditarPredicacionForm
          predicacion={predicacion}
          onSubmit={async data => {
            try {
              await updateDocumentById('predicaciones', id, data);
              setPredicacion({ ...predicacion, ...data });
              setEditMode(false);
              alert('Cambios guardados correctamente');
            } catch (err) {
              alert('Error al guardar cambios: ' + (err.message || 'Error desconocido'));
            }
          }}
        />
      ) : (
        <>
          <h3>{predicacion.titulo}</h3>
          <p><strong>Tema:</strong> {predicacion.tema}</p>
          <p><strong>Audiencia:</strong> {predicacion.audiencia}</p>
          <p><strong>Fecha:</strong> {predicacion.fecha}</p>
          <NotasPersonales notas={notas} onAdd={async n => {
            const nuevasNotas = [...notas, n];
            setNotas(nuevasNotas);
            try {
              await updateDocumentById('predicaciones', id, { notas: nuevasNotas });
            } catch (err) {
              alert('Error al guardar nota: ' + (err.message || 'Error desconocido'));
            }
          }} />
          <button onClick={() => setEditMode(true)}>Editar</button>
          <button style={{marginLeft:'8px',color:'red'}} onClick={async () => {
            if(window.confirm('¿Seguro que deseas eliminar esta predicación?')){
              try {
                await deleteDocumentById('predicaciones', id);
                alert('Predicación eliminada correctamente');
                window.location.reload();
              } catch (err) {
                alert('Error al eliminar: ' + (err.message || 'Error desconocido'));
              }
            }
          }}>Eliminar</button>
          <button style={{marginLeft:'8px',background:'#1976d2',color:'#fff'}} onClick={() => setModoPredicacion(true)}>
            Modo Predicación
          </button>
        </>
      )}
    </div>
  );
};

export default PredicacionDetalle;
