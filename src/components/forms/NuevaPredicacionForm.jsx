/**
 * @fileoverview Formulario para crear una nueva predicación
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Permite al usuario ingresar los datos básicos para una nueva predicación.
 *
 * @usage
 * <NuevaPredicacionForm />
 */
import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { sugerirPredicacion } from '../../services/external/aiService';

const NuevaPredicacionForm = ({ onSubmit }) => {
  const [titulo, setTitulo] = useState('');
  const [tema, setTema] = useState('');
  const [audiencia, setAudiencia] = useState('');
  const [fecha, setFecha] = useState('');
  const [sugerencias, setSugerencias] = useState(null);
  const [loadingSugerencias, setLoadingSugerencias] = useState(false);
  const [disparadores, setDisparadores] = useState([]);
  const [nota, setNota] = useState('');
  const [notas, setNotas] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ titulo, tema, audiencia, fecha, disparadores, notas });
  };

  const handleSugerir = async () => {
    setLoadingSugerencias(true);
    const datos = { titulo, tema, audiencia, fecha };
    const result = await sugerirPredicacion(datos);
    setSugerencias(result);
    setLoadingSugerencias(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="text"
        placeholder="Título de la predicación"
        value={titulo}
        onChange={e => setTitulo(e.target.value)}
        required
      />
      <Input
        type="text"
        placeholder="Tema principal"
        value={tema}
        onChange={e => setTema(e.target.value)}
        required
      />
      <Input
        type="text"
        placeholder="Audiencia objetivo"
        value={audiencia}
        onChange={e => setAudiencia(e.target.value)}
        required
      />
      <Input
        type="date"
        placeholder="Fecha"
        value={fecha}
        onChange={e => setFecha(e.target.value)}
        required
      />
      <div style={{margin:'12px 0'}}>
        <h4>Disparadores Mentales</h4>
        <Input
          type="text"
          placeholder="Agregar disparador mental"
          value={nota}
          onChange={e => setNota(e.target.value)}
        />
        <Button type="button" onClick={() => {
          if(nota.trim()){
            setDisparadores([...disparadores, nota]);
            setNota('');
          }
        }}>Agregar</Button>
        <ul>
          {disparadores.map((d,i) => <li key={i}>{d}</li>)}
        </ul>
      </div>
      <div style={{margin:'12px 0'}}>
        <h4>Notas Personales</h4>
        <Input
          type="text"
          placeholder="Agregar nota personal"
          value={nota}
          onChange={e => setNota(e.target.value)}
        />
        <Button type="button" onClick={() => {
          if(nota.trim()){
            setNotas([...notas, nota]);
            setNota('');
          }
        }}>Agregar</Button>
        <ul>
          {notas.map((n,i) => <li key={i}>{n}</li>)}
        </ul>
      </div>
      <Button type="submit">Crear Predicación</Button>
      <Button type="button" style={{marginLeft:'8px',background:'#43a047'}} onClick={handleSugerir}>
        {loadingSugerencias ? 'Generando sugerencias...' : 'Obtener Sugerencias IA'}
      </Button>
      {sugerencias && (
        <div style={{marginTop:'16px',background:'#f5f5f5',padding:'12px',borderRadius:'6px'}}>
          <h4>Sugerencias IA</h4>
          <p><strong>Introducción:</strong> {sugerencias.introduccion}</p>
          <ul>
            {sugerencias.puntos.map((p,i) => <li key={i}>{p}</li>)}
          </ul>
          <p><strong>Conclusión:</strong> {sugerencias.conclusiones}</p>
        </div>
      )}
    </form>
  );
};

export default NuevaPredicacionForm;
