/**
 * @fileoverview Página de configuración de cuenta de usuario
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Permite al usuario gestionar su perfil y configuración de cuenta.
 *
 * @usage
 * <CuentaPage />
 */
import React, { useState, useEffect } from 'react';
import PerfilUsuario from '../components/feature/PerfilUsuario';
import { getDocumentById, updateDocumentById } from '../services/database/firestoreService';

const CuentaPage = () => {
  const userId = window?.AppContext?.user?.uid || 'anon';
  const [user, setUser] = useState({});
  const [estadisticas, setEstadisticas] = useState({ predicaciones: 0, favoritos: 0 });

  useEffect(() => {
    const fetchUser = async () => {
      const data = await getDocumentById('usuarios', userId);
      setUser(data || {});
      setEstadisticas({
        predicaciones: data?.predicaciones?.length || 0,
        favoritos: data?.favoritos?.length || 0
      });
    };
    if (userId) fetchUser();
  }, [userId]);

  const handleUpdate = async datos => {
    await updateDocumentById('usuarios', userId, datos);
    setUser({ ...user, ...datos });
    alert('Perfil actualizado');
  };

  return (
    <div>
      <h2>Configuración de Cuenta</h2>
      <p>Gestiona tu perfil y preferencias de usuario.</p>
      <PerfilUsuario user={user} onUpdate={handleUpdate} estadisticas={estadisticas} />
    </div>
  );
};

export default CuentaPage;
