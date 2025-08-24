import React from 'react';

export default function IdeaView({ idea, onEditar }) {
  return (
    <div style={{border:'1px solid #e3eafc',borderRadius:8,padding:16,marginBottom:18,background:'#f8f9fa'}}>
      <h1 style={{fontSize:'1.3em',marginBottom:8}}>{idea.h1}</h1>
      <div style={{fontStyle:'italic',color:'#4285F4',marginBottom:8}}>{idea.cita}</div>
      <ul style={{marginLeft:18}}>
        {idea.viñetas && idea.viñetas.map((v,i)=>(v?<li key={i} style={{fontWeight:'bold',marginBottom:4}}>{v}</li>:null))}
      </ul>
      <button style={{background:'#F4B400',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontSize:'0.98em',cursor:'pointer'}} onClick={onEditar}>Editar</button>
    </div>
  );
}
