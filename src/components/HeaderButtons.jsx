import React from 'react';
import { loginWithGoogle } from '../services/auth/authService';

const HeaderButtons = ({ onPrepararSermon }) => {
  const [isCompact, setIsCompact] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 900);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleMenuClick = () => setMenuOpen(!menuOpen);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      window.location.reload(); // Refresca para mostrar sesión activa
    } catch (err) {
      alert('Error al iniciar sesión con Google: ' + (err.message || 'Error desconocido'));
    }
  };

  return (
    <div style={{position:'relative',display:'flex',gap:'16px'}}>
      {isCompact ? (
        <>
          <button style={btnStyle} onClick={handleMenuClick}>Menú</button>
          {menuOpen && (
            <div style={{position:'absolute',top:'48px',right:0,background:'#fff',boxShadow:'0 2px 8px rgba(66,133,244,0.12)',borderRadius:'8px',padding:'8px 0',zIndex:10,minWidth:'180px'}}>
              <button style={{...btnStyle,width:'100%',margin:'4px 0'}} onClick={()=>{setMenuOpen(false); onPrepararSermon && onPrepararSermon();}}>Preparar sermón</button>
              <button style={{...btnStyle,width:'100%',margin:'4px 0'}} onClick={()=>setMenuOpen(false)}>Sermones preparados</button>
              <button style={{...btnStyle,width:'100%',margin:'4px 0'}} onClick={()=>setMenuOpen(false)}>Configuración</button>
              <button style={{...btnStyle,width:'100%',margin:'4px 0'}} onClick={handleLogin}>Login</button>
            </div>
          )}
        </>
      ) : (
        <>
          <button style={btnStyle} onClick={onPrepararSermon}>Preparar sermón</button>
          <button style={btnStyle}>Sermones preparados</button>
          <button style={btnStyle}>Configuración</button>
          <button style={btnStyle} onClick={handleLogin}>Login</button>
        </>
      )}
    </div>
  );
};

const btnStyle = {
  background: 'linear-gradient(90deg,#5b9df9,#5be09d)',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '10px 22px',
  fontWeight: 'bold',
  fontSize: '1.05rem',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(66,133,244,0.12)',
  transition: 'transform 0.1s',
  letterSpacing: '0.5px',
  outline: 'none',
  marginTop: '2px',
};

export default HeaderButtons;
