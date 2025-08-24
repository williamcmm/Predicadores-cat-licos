import React, { useState } from 'react';
import LoaderConConsejos from './LoaderConConsejos';

// Componente para renderizar categorías colapsadas y respuestas
function CategoriasGemini({ agrupados }) {
  const [openCat, setOpenCat] = useState({});
  const [expanded, setExpanded] = useState({});

  const handleToggleCat = cat => setOpenCat(prev => ({ ...prev, [cat]: !prev[cat] }));
  const handleToggleExpand = id => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const handleCopiar = (texto) => {
    navigator.clipboard.writeText(texto).then(() => {
      console.log("Texto copiado al portapapeles");
    }).catch(err => {
      console.error("Error al copiar texto: ", err);
    });
  };

  const categoriasGemini = [
    "DOCTRINA CATÓLICA",
    "CATECISMO",
    "SANTORAL CATÓLICO",
    "CITAS BÍBLICAS RELEVANTES",
    "REFLEXIONES SOBRE EL TEMA",
    "EJEMPLOS PRÁCTICOS",
    "TESTIMONIOS Y EXPERIENCIAS",
    "DATOS CIENTÍFICOS/HISTÓRICOS",
    "DOCUMENTOS OFICIALES DE LA IGLESIA"
  ];
  
  const agrupadosSafe = agrupados || {};

  return (
    <div>
      {categoriasGemini.map(cat => {
        const items = agrupadosSafe[cat] || [];
        if (items.length === 0) return null;

        return (
          <div key={cat} style={{marginBottom:12}}>
            <h3
              style={{color:'#4285F4',cursor:'pointer',display:'flex',alignItems:'center',gap:'8px',fontWeight:600,fontSize:'1.1rem'}}
              onClick={() => handleToggleCat(cat)}
            >
              {cat} <span style={{fontSize:'1em',color:'#666',fontWeight:'400'}}>({items.length})</span> {openCat[cat] ? '▼' : '▶'}
            </h3>
            {openCat[cat] && items.map((item, idx) => {
                const uniqueId = `${cat}-${idx}`;
                const isExpanded = expanded[uniqueId];
                return (
                  <div key={uniqueId} style={{background:'#f8fafc',padding:'12px',marginBottom:'8px',borderRadius:'6px',boxShadow:'0 1px 4px rgba(66,133,244,0.07)', maxWidth:'100%'}}>
                    <div style={{
                      marginBottom: 8,
                      whiteSpace: 'pre-line',
                      ...(!isExpanded && { 
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      })
                    }}>
                      {item.texto}
                    </div>
                    <div style={{display:'flex', gap: 12, alignItems: 'center', marginTop: '8px'}}>
                      <button onClick={() => handleToggleExpand(uniqueId)} style={{background:'none', border:'none', color:'#4285F4', cursor:'pointer', padding:0, fontSize:'0.9em'}}>
                        {isExpanded ? 'Mostrar menos' : 'Leer más'}
                      </button>
                      {item.fuente && <a href={item.fuente} target="_blank" rel="noopener noreferrer" style={{fontSize:'0.9em'}}>Revisar fuente</a>}
                      <button onClick={()=>handleCopiar(item.texto)} style={{background:'none', border:'none', color:'#4285F4', cursor:'pointer', padding:0, fontSize:'0.9em'}}>Copiar</button>
                    </div>
                  </div>
                )
              })
            }
          </div>
        )
      })}
    </div>
  );
}

const GeminiBuscador = ({ onSearch, onSuggestSermon, onCreateManual, resources, suggestions, isLoading, error }) => {
  const [query, setQuery] = useState('');
  const [showSugerencias, setShowSugerencias] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowSugerencias(false);
    onSearch(query);
  };

  const handleSuggestionClick = (tema) => {
    setQuery(tema);
    setShowSugerencias(false);
    onSearch(tema);
  }

  const hasResults = !isLoading && Object.keys(resources).some(key => resources[key] && resources[key].length > 0);
  const showInitialInstructions = !isLoading && !hasResults && (!suggestions || suggestions.length === 0);

  return (
    <div style={{ padding: '16px', height: '100%', overflowY: 'auto' }}>
      <div style={{fontWeight:'bold',fontSize:'1.2rem',color:'#2c3e50',marginBottom:'18px',background:'#e3eafc',padding:'10px',borderRadius:'8px'}}>
        Buscador de Recursos y Asistente IA
      </div>
      <form onSubmit={handleFormSubmit} style={{display:'flex',gap:8,marginBottom:8,position:'relative'}} autoComplete="off">
        <input
          id="input-gemini-buscador"
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setShowSugerencias(true)}
          onBlur={() => setTimeout(()=>setShowSugerencias(false), 200)}
          placeholder="Buscar un tema..."
          style={{flex:1,padding:8,fontSize:'1.1rem'}}
        />
        <button type="submit" disabled={isLoading} style={{padding:'8px 18px',fontSize:'1.1rem',background: isLoading ? '#b3b3b3' : '#4285F4',color:'#fff',border:'none',borderRadius:'8px',cursor: isLoading ? 'not-allowed' : 'pointer'}}>
          {isLoading ? 'Buscando...' : 'Buscar'}
        </button>
        {showSugerencias && suggestions && suggestions.length > 0 && (
            <div style={{position:'absolute',top:'44px',left:0,right:0,zIndex:10,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'8px',boxShadow:'0 1px 4px rgba(66,133,244,0.07)',padding:'8px 0'}}>
              <div style={{fontWeight:'bold',fontSize:'1rem',color:'#4285F4',margin:'8px 0 8px 16px'}}>Sugerencias de temas:</div>
              <ul style={{listStyle:'none',margin:0,padding:0}}>
                  {suggestions.map((tema, idx) => (
                    <li key={idx} style={{padding:'8px 16px',cursor:'pointer',fontSize:'1.05rem',borderBottom:'1px solid #e2e8f0'}} onMouseDown={()=> handleSuggestionClick(tema)}>{tema}</li>
                  ))}
              </ul>
            </div>
        )}
      </form>

      {showInitialInstructions && (
        <div style={{ margin: '24px 0', padding: '16px', background: '#f0f8ff', borderRadius: '8px', textAlign: 'left', border: '1px solid #d0e0ff' }}>
          <p style={{ margin: 0, fontSize: '1.1em', color: '#333' }}>
            Escribe un tema para buscar recursos o deja el campo vacío y haz clic en Buscar para recibir sugerencias de temas.
          </p>
        </div>
      )}

      {hasResults && (
        <div style={{ margin: '24px 0', padding: '20px', background: '#e6f4ea', borderRadius: '8px', textAlign: 'center', border: '1px solid #c8e6c9' }}>
          <h3 style={{ marginTop: 0, color: '#2e7d32' }}>¿Cómo quieres continuar?</h3>
          <p style={{color: '#555'}}>Hemos encontrado recursos para tu tema. Elige el siguiente paso:</p>
          <div style={{display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px'}}>
            <button onClick={onSuggestSermon} disabled={isLoading} style={{padding:'10px 20px',fontSize:'1.1rem',background: isLoading ? '#b3b3b3' : '#34A853',color:'#fff',border:'none',borderRadius:'8px',cursor: isLoading ? 'not-allowed' : 'pointer'}}>
              Sugerir Sermón (Automático)
            </button>
            <button onClick={onCreateManual} disabled={isLoading} style={{padding:'10px 20px',fontSize:'1.1rem',background: isLoading ? '#b3b3b3' : '#ffb300',color:'#fff',border:'none',borderRadius:'8px',cursor: isLoading ? 'not-allowed' : 'pointer'}}>
              Crear con Títulos Guía (Manual)
            </button>
          </div>
        </div>
      )}

      {isLoading && <LoaderConConsejos />}
      {error && <p style={{color:'red', fontWeight: 'bold', marginTop: '1rem'}}>{error}</p>}
      {!isLoading && <CategoriasGemini agrupados={resources} />}
    </div>
  );
}

export default GeminiBuscador;