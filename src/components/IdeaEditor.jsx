import React, { useState } from 'react';
import { consultarGemini } from '../services/geminiService2';

export default function IdeaEditor({ idea, onGuardar }) {
  const [h1, setH1] = useState(idea.h1);
  const [cita, setCita] = useState(idea.cita);
  const [viñetas, setViñetas] = useState(idea.viñetas || ['', '', '', '']);
  const [sugH1, setSugH1] = useState([]);
  const [sugCita, setSugCita] = useState([]);
  const [sugV, setSugV] = useState([[],[],[],[],[]]);
  const [loading, setLoading] = useState(false);
  // Sugerencias Gemini
  const pedirSugerencias = async (tipo, idx=null) => {
    setLoading(true);
    let prompt = '';
    if(tipo==='h1') prompt = 'Sugiere títulos principales para un sermón católico sobre: '+h1;
    if(tipo==='cita') prompt = 'Sugiere una cita bíblica o doctrinal para: '+h1;
    if(tipo==='viñeta') prompt = 'Sugiere ideas cortas (disparadores mentales) para explicar: '+h1;
    try {
      const res = await consultarGemini(prompt);
      const texto = res?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const sugerencias = texto.split('\n').filter(t=>t.trim());
      if(tipo==='h1') setSugH1(sugerencias);
      if(tipo==='cita') setSugCita(sugerencias);
      if(tipo==='viñeta' && idx!==null) {
        const nv = [...sugV]; nv[idx]=sugerencias; setSugV(nv);
      }
    } catch(e) { alert('Error consultando Gemini'); }
    setLoading(false);
  };

  const handleGuardar = () => {
    onGuardar({ h1, cita, viñetas });
  };

  return (
    <div style={{border:'1px solid #e3eafc',borderRadius:8,padding:16,marginBottom:18,background:'#fff'}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <input value={h1} onChange={e=>setH1(e.target.value)} placeholder="Idea principal (H1)" style={{flex:1,padding:8,fontSize:'1.1em',borderRadius:6,border:'1px solid #ccc'}} />
        <button style={{background:'#4285F4',color:'#fff',border:'none',borderRadius:6,padding:'6px 12px',fontSize:'0.98em',cursor:'pointer'}} disabled={loading} onClick={()=>pedirSugerencias('h1')}>IA</button>
        {sugH1.length>0 && (
          <div style={{position:'absolute',background:'#fff',border:'1px solid #4285F4',borderRadius:6,boxShadow:'0 2px 8px #4285F455',padding:8,top:38,left:0,zIndex:10}}>
            {sugH1.map((s,i)=>(<div key={i} style={{padding:'4px 0',cursor:'pointer'}} onClick={()=>{setH1(s);setSugH1([]);}}>{s}</div>))}
          </div>
        )}
      </div>
      <div style={{marginTop:12,display:'flex',alignItems:'center',gap:8,position:'relative'}}>
        <input value={cita} onChange={e=>setCita(e.target.value)} placeholder="Cita bíblica o doctrinal" style={{flex:1,padding:8,fontSize:'1em',borderRadius:6,border:'1px solid #ccc'}} />
        <button style={{background:'#4285F4',color:'#fff',border:'none',borderRadius:6,padding:'6px 12px',fontSize:'0.98em',cursor:'pointer'}} disabled={loading} onClick={()=>pedirSugerencias('cita')}>IA</button>
        {sugCita.length>0 && (
          <div style={{position:'absolute',background:'#fff',border:'1px solid #4285F4',borderRadius:6,boxShadow:'0 2px 8px #4285F455',padding:8,top:38,left:0,zIndex:10}}>
            {sugCita.map((s,i)=>(<div key={i} style={{padding:'4px 0',cursor:'pointer'}} onClick={()=>{setCita(s);setSugCita([]);}}>{s}</div>))}
          </div>
        )}
      </div>
      <div style={{marginTop:12}}>
        <b>Viñetas (3-5 disparadores mentales):</b>
        {viñetas.map((v, i) => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginTop:6,position:'relative'}}>
            <input value={v} onChange={e=>{
              const nv = [...viñetas]; nv[i]=e.target.value; setViñetas(nv);
            }} placeholder={`Viñeta ${i+1}`} style={{flex:1,padding:7,fontSize:'0.98em',borderRadius:6,border:'1px solid #ccc'}} />
            <button style={{background:'#4285F4',color:'#fff',border:'none',borderRadius:6,padding:'6px 12px',fontSize:'0.98em',cursor:'pointer'}} disabled={loading} onClick={()=>pedirSugerencias('viñeta',i)}>IA</button>
            {sugV[i] && sugV[i].length>0 && (
              <div style={{position:'absolute',background:'#fff',border:'1px solid #4285F4',borderRadius:6,boxShadow:'0 2px 8px #4285F455',padding:8,top:38,left:0,zIndex:10}}>
                {sugV[i].map((s,j)=>(<div key={j} style={{padding:'4px 0',cursor:'pointer'}} onClick={()=>{
                  const nv = [...viñetas]; nv[i]=s; setViñetas(nv);
                  const sv = [...sugV]; sv[i]=[]; setSugV(sv);
                }}>{s}</div>))}
              </div>
            )}
          </div>
        ))}
      </div>
      <button style={{marginTop:16,background:'#4285F4',color:'#fff',border:'none',borderRadius:6,padding:'7px 18px',fontSize:'1em',cursor:'pointer'}} onClick={handleGuardar}>Guardar</button>
    </div>
  );
}
