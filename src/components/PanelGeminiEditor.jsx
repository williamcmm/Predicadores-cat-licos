import React, { useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { consultarGemini } from '../services/geminiService2';

const categorias = [
  'Doctrina católica',
  'Citas bíblicas',
  'Ejemplos prácticos',
  'Testimonios',
  'Datos científicos',
  'Videos de Youtube'
];

export default function PanelGeminiEditor({ setResultadosGemini }) {
  const [fase, setFase] = useState('sugerir'); // 'sugerir' o 'categorias'
  const [query, setQuery] = useState('');
  const [titulosSugeridos, setTitulosSugeridos] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  // El estado openCat y el menú de categorías se moverán al panel derecho
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Escribe tu sermón aquí...</p>',
  });

  // Buscar en Gemini y sugerir título
  const handleBuscar = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let prompt = '';
      if (fase === 'sugerir') {
        prompt = `Sugiere al menos 5 títulos breves y atractivos para un sermón sobre el tema: "${query}". No uses nombres de personas, solo frases inspiradoras. Responde solo la lista de títulos, sin autores ni explicaciones.`;
      } else {
        prompt = `Busca información relevante sobre "${query}" para preparar un sermón católico. Organiza la respuesta en estas categorías exactas: DOCTRINA CATÓLICA, CITAS BÍBLICAS, EJEMPLOS PRÁCTICOS, TESTIMONIOS, DATOS CIENTÍFICOS, VIDEOS DE YOUTUBE. No uses nombres de personas ni autores, solo contenido doctrinal, bíblico y pastoral.`;
      }
      const respuesta = await consultarGemini(prompt);
      let texto = '';
      if (respuesta.candidates && respuesta.candidates[0]?.content?.parts?.[0]?.text) {
        texto = respuesta.candidates[0].content.parts[0].text;
      } else if (typeof respuesta === 'string') {
        texto = respuesta;
      } else {
        texto = JSON.stringify(respuesta);
      }
      const lineas = texto.split('\n').map(l=>l.trim()).filter(l=>l);
      if (fase === 'sugerir') {
        setTitulosSugeridos(lineas);
        setShowDropdown(lineas.length > 0);
        setFase('categorias');
      } else {
        // Agrupar resultados por categorías
        const agrupados = {};
        let actual = '';
        lineas.forEach(linea => {
          const cat = categorias.find(c => linea.toLowerCase().includes(c.toLowerCase()));
          if (cat) {
            actual = cat;
            agrupados[cat] = [];
          } else if (actual && linea.trim()) {
            agrupados[actual].push(linea);
          }
        });
        if (typeof setResultadosGemini === 'function') setResultadosGemini(agrupados);
        setFase('sugerir');
      }
    } catch (err) {
      setShowDropdown(false);
      setTitulosSugeridos([]);
      if (typeof setResultadosGemini === 'function') setResultadosGemini({});
      setError('Error consultando Gemini: ' + err.message);
    }
    setLoading(false);
  };

  // Asistente Gemini para el editor
  const opcionesGemini = [
    { label: 'Resumir texto', prompt: 'Resume el siguiente texto en una frase clave:' },
    { label: 'Crear disparador mental', prompt: 'Genera un disparador mental para recordar este fragmento:' },
    { label: 'Sugerir H1', prompt: 'Sugiere un título H1 breve y atractivo para este texto:' },
    { label: 'Reescribir como exposición/oratoria', prompt: 'Reescribe este texto como si fuera una exposición oral, estilo sermón, con tono persuasivo y fluido:' },
    { label: 'Disparador mental con liga de memoria', prompt: 'Convierte este texto en un disparador mental: la primera parte debe ser el recordatorio, la segunda parte debe sonar como una oratoria que liga la memoria y la fluidez al hablar.' }
  ];
  const [showMenu, setShowMenu] = useState(false);
  const handleGemini = async (opcion) => {
    if (!editor) return;
    const texto = editor.state.doc.cut(editor.state.selection.from, editor.state.selection.to).textContent;
    if (!texto) {
      setError('Selecciona un texto para enviar a Gemini.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const respuesta = await consultarGemini(`${opcion.prompt}\n${texto}`);
      editor.commands.insertContentAt(editor.state.selection, respuesta.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta');
    } catch (err) {
      setError('Error consultando Gemini: ' + err.message);
    }
    setLoading(false);
    setShowMenu(false);
  };

  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column',padding:'24px',background:'rgba(255,255,255,0.9)',borderRadius:'15px',boxShadow:'0 8px 32px rgba(0,0,0,0.1)',backdropFilter:'blur(10px)',overflow:'auto'}}>
      <form onSubmit={handleBuscar} style={{display:'flex',gap:8,marginBottom:16,position:'relative'}}>
        <div style={{flex:1,position:'relative'}}>
          <input
            type="text"
            value={query}
            onChange={e => {setQuery(e.target.value); setShowDropdown(false); setFase('sugerir');}}
            placeholder={fase==='sugerir' ? "Escribe el tema o consulta..." : "Selecciona un título y vuelve a buscar"}
            style={{width:'100%',padding:'10px',fontSize:'1.1rem',borderRadius:'6px',border:'1px solid #ccc'}}
            onFocus={()=>{if(titulosSugeridos.length>0)setShowDropdown(true);}}
            autoComplete="off"
          />
          {showDropdown && titulosSugeridos.length > 0 && (
            <ul style={{position:'absolute',top:'100%',left:0,right:0,zIndex:10,background:'#fff',border:'1px solid #4285F4',borderRadius:'6px',boxShadow:'0 2px 8px rgba(66,133,244,0.12)',margin:0,padding:'4px 0',listStyle:'none',maxHeight:'180px',overflowY:'auto'}}>
              {titulosSugeridos.map((t, idx) => (
                <li key={idx} style={{padding:'8px 12px',cursor:'pointer',borderBottom:'1px solid #eee'}} onClick={()=>{setQuery(t);setShowDropdown(false);}}>{t}</li>
              ))}
            </ul>
          )}
        </div>
  <button type="submit" style={{padding:'10px 18px',fontSize:'1.1rem',background:'#4285F4',color:'#fff',border:'none',borderRadius:'8px'}}>{fase==='sugerir' ? 'Buscar en Gemini' : 'Buscar contenido'}</button>
      </form>
      {loading && <span style={{color:'#007bff'}}>Consultando Gemini...</span>}
      {error && <span style={{color:'red'}}>{error}</span>}
  {/* El campo de título editable se elimina, solo se usa el input principal y el desplegable */}
      {/* Editor de texto asistido */}
      <div style={{marginBottom:16}}>
        <div style={{display:'flex',gap:8,marginBottom:8}}>
          <button onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
          <button onClick={() => editor?.chain().focus().toggleBulletList().run()}>Viñetas</button>
          <button onClick={() => editor?.chain().focus().toggleBold().run()}>Negrita</button>
          <button onClick={() => setShowMenu(!showMenu)} style={{background:'#4285F4',color:'#fff',borderRadius:6,padding:'8px 16px'}}>Asistente Gemini</button>
        </div>
        {showMenu && (
          <div style={{background:'#f8f9fa',border:'1px solid #ddd',borderRadius:8,padding:12,marginBottom:12}}>
            <strong>¿Qué quieres hacer con el texto seleccionado?</strong>
            <ul style={{listStyle:'none',padding:0,marginTop:8}}>
              {opcionesGemini.map((op, idx) => (
                <li key={idx} style={{marginBottom:8}}>
                  <button onClick={() => handleGemini(op)} style={{padding:'6px 12px',borderRadius:4,border:'1px solid #4285F4',background:'#fff',color:'#4285F4',cursor:'pointer'}}>{op.label}</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div style={{flex:1,border:'1px solid #eee',borderRadius:10,padding:16,background:'#fff',overflow:'auto'}}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
