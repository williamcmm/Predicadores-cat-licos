import React from 'react';

export default function PredicacionFullScreen({ ideas, onClose }) {
  React.useEffect(()=>{
    document.body.style.overflow = 'hidden';
    return ()=>{ document.body.style.overflow = 'auto'; };
  },[]);
  return (
    <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#fff',zIndex:9999,padding:'32px',overflowY:'auto'}}>
      <button style={{position:'absolute',top:18,right:28,background:'#EA4335',color:'#fff',border:'none',borderRadius:6,padding:'8px 18px',fontSize:'1em',cursor:'pointer'}} onClick={onClose}>Cerrar</button>
      <h2 style={{marginBottom:24}}>Modo Predicación</h2>
      {ideas.map((idea,idx)=>(
        <div key={idx} style={{marginBottom:32}}>
          <h1 style={{fontSize:'1.2em',marginBottom:8}}>{idea.h1}</h1>
          <ul style={{marginLeft:18}}>
            {idea.viñetas && idea.viñetas.map((v,i)=>(v?<li key={i} style={{fontWeight:'bold',fontSize:'1.1em',marginBottom:4}}>{v}</li>:null))}
          </ul>
        </div>
      ))}
    </div>
  );
}
