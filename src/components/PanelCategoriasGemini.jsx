import React, { useState } from 'react';

const categorias = [
  'Doctrina católica',
  'Citas bíblicas',
  'Ejemplos prácticos',
  'Testimonios',
  'Datos científicos',
  'Videos de Youtube'
];

export default function PanelCategoriasGemini({ resultados }) {
  const [openCat, setOpenCat] = useState({});
  return (
    <div style={{padding:'24px',background:'rgba(255,255,255,0.9)',borderRadius:'15px',boxShadow:'0 8px 32px rgba(0,0,0,0.1)',backdropFilter:'blur(10px)',height:'100%',overflow:'auto'}}>
      <strong style={{fontSize:'1.1rem',marginBottom:8,display:'block'}}>Categorías encontradas:</strong>
      {categorias.map(cat => {
        const items = resultados[cat] || [];
        return (
          <div key={cat} style={{marginBottom:'18px'}}>
            <div
              style={{color:'#4285F4',cursor:'pointer',display:'flex',alignItems:'center',gap:'8px',fontWeight:600,fontSize:'1.08rem'}}
              onClick={() => setOpenCat(prev => ({...prev, [cat]: !prev[cat]}))}
            >
              {cat} <span style={{fontSize:'1em',color:'#666',fontWeight:'400'}}>({items.length})</span> {openCat[cat] ? '▼' : '▶'}
            </div>
            {openCat[cat] && (
              <div style={{marginTop:'12px'}}>
                {items.length === 0 ? (
                  <div style={{color:'#aaa',fontStyle:'italic',marginBottom:'12px'}}>Sin resultados</div>
                ) : items.map((linea, idx) => (
                  <CategoriaResultado key={idx} texto={typeof linea === 'string' ? linea : linea.texto} fuente={linea.fuente} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CategoriaResultado({ texto, fuente }) {
  const [expandido, setExpandido] = useState(false);
  // Mostrar solo tres líneas (aprox 270 caracteres) y botón Leer más
  const resumen = texto.length > 270 ? texto.slice(0,270).replace(/\n/g,' ') : texto;
  return (
    <div style={{marginBottom:'18px',padding:'16px',background:'#f8f9fa',borderRadius:'10px',boxShadow:'0 2px 8px rgba(66,133,244,0.07)',textAlign:'justify',lineHeight:'1.7',border:'1px solid #e3eafc'}}>
      {!expandido ? (
        <>
          <div style={{marginBottom:8, overflow:'hidden', display:'-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient:'vertical', whiteSpace:'pre-line', position:'relative'}}>
            {resumen}
          </div>
          {texto.length > 270 && (
            <div style={{width:'100%',textAlign:'left',marginTop:6}}>
              <a style={{color:'#4285F4',cursor:'pointer',textDecoration:'underline',fontWeight:'bold'}} onClick={()=>setExpandido(true)}>Leer más</a>
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{marginBottom:8, whiteSpace:'pre-line', position:'relative'}}>
            {texto}
          </div>
          <div style={{width:'100%',textAlign:'left',marginTop:6}}>
            <a style={{color:'#4285F4',cursor:'pointer',textDecoration:'underline',fontWeight:'bold'}} onClick={()=>setExpandido(false)}>Mostrar menos</a>
          </div>
        </>
      )}
      {fuente && (
        <div style={{display:'flex',gap:12,marginTop:8,justifyContent:'flex-end'}}>
          <a href={fuente} target="_blank" rel="noopener noreferrer" style={{color:'#4285F4',fontWeight:'bold',textDecoration:'underline'}}>Consultar fuente</a>
        </div>
      )}
    </div>
  );
}
