import React, { useState } from 'react';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_API_KEY = 'AIzaSyC8oC--YkZtOvldXRS1uE6_tv-Rm6cGDZQ';

export default function GeminiSearchPanel() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults('');
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: query }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      });
      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        setResults(data.candidates[0].content.parts[0].text);
      } else {
        setError('No se pudo obtener resultados de Gemini.');
      }
    } catch (err) {
      setError('Error al consultar Gemini: ' + err.message);
    }
    setLoading(false);
  };

  // Categorías esperadas
  const categorias = [
    'DOCTRINA CATÓLICA',
    'CITAS BÍBLICAS',
    'EJEMPLOS PRÁCTICOS',
    'APLICACIÓN PASTORAL'
  ];

  // Función para agrupar resultados por categoría
  function parseResults(text) {
    if (!text) return {};
    const blocks = {};
    let actual = '';
    text.split('\n').forEach(linea => {
      const cat = categorias.find(c => linea.toUpperCase().includes(c));
      if (cat) {
        actual = cat;
        blocks[cat] = [];
      } else if (actual && linea.trim()) {
        blocks[actual].push(linea);
      }
    });
    return blocks;
  }

  const resultadosPorCategoria = parseResults(results);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Texto copiado al portapapeles');
  };

  return (
    <div style={{background: '#f8f9fa', border: '3px solid #007bff', borderRadius: '10px', padding: '20px', height: '100%', display: 'flex', flexDirection: 'column'}}>
      <h2 style={{color: '#007bff', marginBottom: '20px', textAlign: 'center', fontSize: '1.5rem'}}>
        🔍 Buscador Gemini para Sermones
      </h2>
      <form onSubmit={handleSearch} style={{display: 'flex', gap: 8, marginBottom: 24}}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ej: Misericordia, Perdón, Fe, Amor de Dios..."
          style={{width:'100%',padding:'12px',border:'2px solid #dee2e6',borderRadius:'6px',fontSize:'1rem',marginBottom:'10px'}}
        />
        <button
          type="submit"
          disabled={loading}
          style={{width:'100%',padding:'12px',background:loading?'#6c757d':'#007bff',color:'white',border:'none',borderRadius:'6px',fontSize:'1rem',cursor:loading?'not-allowed':'pointer',transition:'background-color 0.3s'}}
        >
          {loading ? 'Buscando...' : 'Buscar Material para Sermón'}
        </button>
      </form>
      <div style={{flex:1,background:'white',border:'2px solid #dee2e6',borderRadius:'6px',padding:'15px',overflow:'auto',fontSize:'0.9rem',lineHeight:'1.5'}}>
        {error && <div style={{color:'red',marginBottom:'12px'}}>{error}</div>}
        {results ? (
          <div>
            <div style={{ marginBottom: '10px', textAlign: 'right' }}>
              <button
                onClick={() => copyToClipboard(results)}
                style={{background:'#28a745',color:'white',border:'none',padding:'5px 10px',borderRadius:'4px',cursor:'pointer',fontSize:'0.8rem'}}
              >📋 Copiar Todo</button>
            </div>
            {/* Mostrar resultados por categoría */}
            {categorias.map(cat => (
              resultadosPorCategoria[cat] && resultadosPorCategoria[cat].length > 0 ? (
                <div key={cat} style={{marginBottom:'18px'}}>
                  <h3 style={{color:'#007bff',fontSize:'1.1rem',marginBottom:'8px'}}>{cat}</h3>
                  <ul style={{paddingLeft:'18px'}}>
                    {resultadosPorCategoria[cat].map((linea, idx) => (
                      <li key={idx} style={{marginBottom:'6px'}}>{linea}</li>
                    ))}
                  </ul>
                </div>
              ) : null
            ))}
          </div>
        ) : (
          <div style={{color:'#6c757d',textAlign:'center',paddingTop:'50px'}}>
            <p>💡 Ingresa un tema para buscar material de apoyo</p>
            <p>📖 El sistema buscará:</p>
            <ul style={{textAlign:'left',display:'inline-block'}}>
              <li>Doctrina católica relevante</li>
              <li>Citas bíblicas (Dios Habla Hoy)</li>
              <li>Ejemplos prácticos</li>
              <li>Aplicaciones pastorales</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
  }
