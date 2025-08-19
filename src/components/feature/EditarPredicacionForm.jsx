/**
 * @fileoverview Formulario para editar una predicación
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Permite al usuario modificar los datos de una predicación existente.
 *
 * @usage
 * <EditarPredicacionForm predicacion={obj} onSubmit={fn} />
 */
import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { sugerirPredicacion } from '../../services/external/aiService';

const EditarPredicacionForm = ({ predicacion, onSubmit }) => {
  const [titulo, setTitulo] = useState(predicacion.titulo || '');
  const [tema, setTema] = useState(predicacion.tema || '');
  const [audiencia, setAudiencia] = useState(predicacion.audiencia || '');
  const [fecha, setFecha] = useState(predicacion.fecha || '');
  const [disparadores, setDisparadores] = useState(predicacion.disparadores || []);
  const [nuevoDisparador, setNuevoDisparador] = useState('');
  const [notas, setNotas] = useState(predicacion.notas || []);
  const [nuevaNota, setNuevaNota] = useState('');
  const [sugerencias, setSugerencias] = useState(null);
  const [loadingSugerencias, setLoadingSugerencias] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ titulo, tema, audiencia, fecha, disparadores, notas });
  };

  const handleSugerir = async () => {
    setLoadingSugerencias(true);
    const datos = { titulo, tema, audiencia, fecha };
    const sug = await sugerirPredicacion(datos);
    setSugerencias(sug);
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
          value={nuevoDisparador}
          onChange={e => setNuevoDisparador(e.target.value)}
        />
        <Button type="button" onClick={() => {
          if(nuevoDisparador.trim()){
            setDisparadores([...disparadores, nuevoDisparador]);
            setNuevoDisparador('');
          }
        }}>Agregar</Button>
        <ul>
          {disparadores.map((d,i) => (
            <li key={i}>
              {d}
              <Button type="button" style={{marginLeft:'8px',background:'#e53935'}} onClick={() => {
                setDisparadores(disparadores.filter((_,idx) => idx !== i));
              }}>Eliminar</Button>
            </li>
          ))}
        </ul>
      </div>
      <div style={{margin:'12px 0'}}>
        <h4>Notas Personales</h4>
        <Input
          type="text"
          placeholder="Agregar nota personal"
          value={nuevaNota}
          onChange={e => setNuevaNota(e.target.value)}
        />
        <Button type="button" onClick={() => {
          if(nuevaNota.trim()){
            setNotas([...notas, nuevaNota]);
            setNuevaNota('');
          }
        }}>Agregar</Button>
        <ul>
          {notas.map((n,i) => (
            <li key={i}>
              {n}
              <Button type="button" style={{marginLeft:'8px',background:'#e53935'}} onClick={() => {
                setNotas(notas.filter((_,idx) => idx !== i));
              }}>Eliminar</Button>
            </li>
          ))}
        </ul>
      </div>
      <Button type="submit">Guardar Cambios</Button>
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

export default EditarPredicacionForm;
