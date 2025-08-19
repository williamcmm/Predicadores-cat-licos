/**
 * @fileoverview Componente para editar perfil y mostrar estadísticas de usuario
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Permite al usuario editar sus datos personales y ver estadísticas básicas de uso.
 *
 * @usage
 * <PerfilUsuario user={user} onUpdate={fn} />
 */
import React, { useState } from 'react';
import Button from '../ui/Button';
import { getAuth, signOut, updatePassword } from 'firebase/auth';

const PerfilUsuario = ({ user, onUpdate, estadisticas }) => {
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [email, setEmail] = useState(user?.email || '');
  const [editando, setEditando] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    onUpdate({ nombre, email });
    setEditando(false);
  };

  const [nuevaPassword, setNuevaPassword] = useState('');
  const [cambiandoPass, setCambiandoPass] = useState(false);

  const handleChangePassword = async e => {
    e.preventDefault();
    try {
      const auth = getAuth();
      await updatePassword(auth.currentUser, nuevaPassword);
      alert('Contraseña actualizada correctamente');
      setCambiandoPass(false);
      setNuevaPassword('');
    } catch (err) {
      alert('Error al cambiar contraseña: ' + (err.message || 'Error desconocido'));
    }
  };

  const handleSignOut = async () => {
    const auth = getAuth();
    await signOut(auth);
    window.location.href = '/login';
  };

  return (
    <div style={{margin:'24px 0'}}>
      <h3>Perfil de Usuario</h3>
      {editando ? (
        <form onSubmit={handleSubmit}>
          <label>Nombre:</label>
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required />
          <br />
          <label>Email:</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <br />
          <Button type="submit">Guardar</Button>
        </form>
      ) : (
        <div>
          <p><strong>Nombre:</strong> {nombre}</p>
          <p><strong>Email:</strong> {email}</p>
          <Button type="button" onClick={() => setEditando(true)}>Editar Perfil</Button>
        </div>
      )}
      <div style={{marginTop:'24px'}}>
        <h4>Estadísticas de Uso</h4>
        <ul>
          <li><strong>Predicaciones creadas:</strong> {estadisticas?.predicaciones || 0}</li>
          <li><strong>Recursos favoritos:</strong> {estadisticas?.favoritos || 0}</li>
        </ul>
      </div>
      <div style={{marginTop:'32px'}}>
        {cambiandoPass ? (
          <form onSubmit={handleChangePassword}>
            <label>Nueva contraseña:</label>
            <input type="password" value={nuevaPassword} onChange={e => setNuevaPassword(e.target.value)} required />
            <Button type="submit">Cambiar</Button>
            <Button type="button" style={{marginLeft:'8px'}} onClick={()=>setCambiandoPass(false)}>Cancelar</Button>
          </form>
        ) : (
          <Button type="button" onClick={()=>setCambiandoPass(true)}>Cambiar Contraseña</Button>
        )}
        <Button type="button" style={{marginLeft:'16px',background:'#e53935'}} onClick={handleSignOut}>Cerrar Sesión</Button>
      </div>
    </div>
  );
};

export default PerfilUsuario;
