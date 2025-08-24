import React, { useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { consultarGemini } from '../services/geminiService2';

const opcionesGemini = [
  { label: 'Resumir texto', prompt: 'Resume el siguiente texto en una frase clave:' },
  { label: 'Crear disparador mental', prompt: 'Genera un disparador mental para recordar este fragmento:' },
  { label: 'Sugerir H1', prompt: 'Sugiere un título H1 breve y atractivo para este texto:' },
  { label: 'Reescribir como exposición/oratoria', prompt: 'Reescribe este texto como si fuera una exposición oral, estilo sermón, con tono persuasivo y fluido:' },
  { label: 'Disparador mental con liga de memoria', prompt: 'Convierte este texto en un disparador mental: la primera parte debe ser el recordatorio, la segunda parte debe sonar como una oratoria que liga la memoria y la fluidez al hablar.' }
];

export default function EditorTexto() {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [titulo, setTitulo] = useState('');
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Escribe tu sermón aquí...</p>',
  });

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
      // Inserta la respuesta en el editor, reemplazando la selección
      editor.commands.insertContentAt(editor.state.selection, respuesta.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta');
    } catch (err) {
      setError('Error consultando Gemini: ' + err.message);
    }
    setLoading(false);
    setShowMenu(false);
  };

  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column'}}>
      <div style={{marginBottom:16}}>
        <label style={{fontWeight:'bold',fontSize:'1.1rem',marginBottom:4,display:'block'}}>Título de la enseñanza</label>
        <input
          type="text"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          placeholder="Escribe el título aquí..."
          style={{width:'100%',padding:'10px',fontSize:'1.1rem',borderRadius:'6px',border:'1px solid #ccc',marginBottom:8}}
        />
      </div>
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        <button onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
        <button onClick={() => editor?.chain().focus().toggleBulletList().run()}>Viñetas</button>
        <button onClick={() => editor?.chain().focus().toggleBold().run()}>Negrita</button>
        <button onClick={() => setShowMenu(!showMenu)} style={{background:'#4285F4',color:'#fff',borderRadius:6,padding:'8px 16px'}}>Asistente Gemini</button>
        {loading && <span style={{color:'#007bff'}}>Consultando Gemini...</span>}
        {error && <span style={{color:'red'}}>{error}</span>}
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
      <div style={{flex:1,border:'1px solid #eee',borderRadius:10,padding:16,background:'#fff',overflow:'auto'}}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
