/**
 * @fileoverview Componente base para modo predicación fullscreen
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Muestra la predicación seleccionada en formato visual optimizado para predicación en vivo.
 * Incluye controles de navegación y barra de progreso.
 *
 * @usage
 * <ModoPredicacion predicacion={obj} />
 */
import React, { useState, useEffect, useRef } from 'react';
import DisparadorTooltip from './DisparadorTooltip';

const ModoPredicacion = ({ predicacion }) => {
  const puntos = predicacion?.disparadores?.length > 0 ? predicacion.disparadores : (predicacion?.puntos || []);
  const [actual, setActual] = useState(0);
  const salirRef = useRef();

  const avanzar = () => setActual(a => Math.min(a + 1, puntos.length - 1));
  const retroceder = () => setActual(a => Math.max(a - 1, 0));

  // Accesibilidad: navegación por teclado
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'ArrowRight') avanzar();
      if (e.key === 'ArrowLeft') retroceder();
      if (e.key === 'Escape') salirRef.current?.click();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actual, puntos.length]);

  if (!predicacion) return <p>No hay predicación seleccionada.</p>;

  return (
    <div style={{width:'100vw',height:'100vh',background:'#222',color:'#fff',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',position:'fixed',top:0,left:0,zIndex:2000}}>
      <h2 style={{fontSize:'2.2rem',letterSpacing:'1px'}}>{predicacion.titulo}</h2>
      <h3 style={{fontSize:'1.4rem',marginBottom:'24px',fontWeight:'bold'}}>{predicacion.tema}</h3>
      <div style={{fontSize:'1.6rem',marginBottom:'32px',background:'#333',padding:'18px 32px',borderRadius:'12px',boxShadow:'0 2px 8px #0007'}}>
        {puntos.length > 0 ? (
          <DisparadorTooltip
            frase={puntos[actual]}
            contenido={`Explicación completa sobre: ${puntos[actual]}`}
          />
        ) : 'Sin puntos principales.'}
      </div>
      {Array.isArray(predicacion.notas) && predicacion.notas.length > 0 && (
        <div style={{margin:'18px 0',background:'#444',padding:'12px 24px',borderRadius:'8px',maxWidth:'70vw'}}>
          <h4 style={{color:'#ffd600'}}>Notas Personales</h4>
          <ul>
            {predicacion.notas.map((n,i) => (
              <li key={i} style={{color:'#fff',marginBottom:'6px'}}>{n}</li>
            ))}
          </ul>
        </div>
      )}
      <div style={{width:'60%',margin:'16px auto'}}>
        <div style={{height:'8px',background:'#555',borderRadius:'4px'}}>
          <div style={{height:'8px',background:'#43a047',width:`${((actual+1)/puntos.length)*100}%`,borderRadius:'4px',transition:'width 0.3s'}}></div>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:'8px'}}>
          <button onClick={retroceder} disabled={actual===0} aria-label="Anterior (←)">Anterior</button>
          <span>{actual+1} / {puntos.length}</span>
          <button onClick={avanzar} disabled={actual===puntos.length-1} aria-label="Siguiente (→)">Siguiente</button>
        </div>
        <div style={{marginTop:'12px',fontSize:'1rem',color:'#ccc'}}>
          <span>Usa ← y → para navegar, Esc para salir.</span>
        </div>
      </div>
      <button ref={salirRef} style={{position:'absolute',top:16,right:16,background:'#e53935',color:'#fff',padding:'8px 18px',borderRadius:'6px',fontWeight:'bold'}} onClick={()=>window.location.reload()} aria-label="Salir (Esc)">Salir</button>
    </div>
  );
};

export default ModoPredicacion;
