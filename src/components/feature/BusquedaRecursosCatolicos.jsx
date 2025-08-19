/**
 * @fileoverview Componente de búsqueda semántica en recursos católicos
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Permite buscar conceptos y obtener resultados relevantes de fuentes doctrinales.
 *
 * @usage
 * <BusquedaRecursosCatolicos />
 */
import React, { useState } from 'react';
import { updateDocumentById } from '../../services/database/firestoreService';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { buscarRecursosCatolicos } from '../../services/external/aiService';

const BusquedaRecursosCatolicos = () => {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const userId = window?.AppContext?.user?.uid || 'anon';

  const handleBuscar = async () => {
    setLoading(true);
    const res = await buscarRecursosCatolicos(query);
    setResultados(res);
    setLoading(false);
  };

  const guardarFavorito = async recurso => {
    try {
      // Obtener favoritos actuales del usuario
      // Aquí se podría optimizar con contexto global
      await updateDocumentById('usuarios', userId, {
        favoritos: [recurso]
      });
      alert('Recurso guardado como favorito');
    } catch (err) {
      alert('Error al guardar favorito: ' + (err.message || 'Error desconocido'));
    }
  };

  return (
    <div style={{marginTop:'24px'}}>
      <h4>Búsqueda en Recursos Católicos</h4>
      <Input
        type="text"
        placeholder="Buscar concepto, palabra o frase"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <Button type="button" onClick={handleBuscar}>
        {loading ? 'Buscando...' : 'Buscar'}
      </Button>
      {resultados.length > 0 && (
        <ul style={{marginTop:'12px'}}>
          {resultados.map((r, i) => (
            <li key={i}>
              <strong>{r.fuente}:</strong> {r.texto}
              <Button type="button" style={{marginLeft:'8px',background:'#43a047'}} onClick={() => guardarFavorito(r)}>
                Guardar Favorito
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BusquedaRecursosCatolicos;
