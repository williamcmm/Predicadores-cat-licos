import React, { useState, useEffect } from 'react';
import { FaUsers, FaChartBar, FaTimes, FaUserShield, FaTrash, FaBan, FaCheck } from 'react-icons/fa';
import { obtenerTodosLosUsuarios, actualizarNivelUsuario, obtenerEstadisticasUsuarios, eliminarUsuario, bloquearUsuario } from '../../services/admin/userService';
import { useAuth } from '../../context/AuthContext';
import { userLevels } from '@/constants/user-levels';

const AdminPanel = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('todos');
  const [updatingUser, setUpdatingUser] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usuariosData, statsData] = await Promise.all([
        obtenerTodosLosUsuarios(),
        obtenerEstadisticasUsuarios()
      ]);
      setUsuarios(usuariosData);
      setEstadisticas(statsData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error cargando datos del panel de administración');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateLevel = async (userId, nuevoNivel) => {
    if (userId === currentUser.uid && nuevoNivel !== 'administrador') {
      alert('No puedes cambiar tu propio nivel de administrador');
      return;
    }

    setUpdatingUser(userId);
    try {
      await actualizarNivelUsuario(userId, nuevoNivel);
      
      // Actualizar estado local
      setUsuarios(usuarios.map(user => 
        user.id === userId 
          ? { ...user, userLevel: nuevoNivel }
          : user
      ));
      
      // Actualizar estadísticas
      await fetchData();
      
    } catch (error) {
      console.error('Error actualizando nivel:', error);
      alert('Error actualizando nivel de usuario');
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleEliminarUsuario = async (userId, email) => {
    if (userId === currentUser.uid) {
      alert('No puedes eliminar tu propia cuenta');
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar al usuario ${email}? Esta acción no se puede deshacer.`)) {
      setUpdatingUser(userId);
      try {
        await eliminarUsuario(userId);
        
        // Remover del estado local
        setUsuarios(usuarios.filter(user => user.id !== userId));
        
        // Actualizar estadísticas
        await fetchData();
        
        alert('Usuario eliminado exitosamente');
      } catch (error) {
        console.error('Error eliminando usuario:', error);
        alert('Error al eliminar usuario');
      } finally {
        setUpdatingUser(null);
      }
    }
  };

  const handleBloquearUsuario = async (userId, email, bloqueado) => {
    if (userId === currentUser.uid) {
      alert('No puedes bloquear tu propia cuenta');
      return;
    }

    const accion = bloqueado ? 'desbloquear' : 'bloquear';
    if (window.confirm(`¿Estás seguro de ${accion} al usuario ${email}?`)) {
      setUpdatingUser(userId);
      try {
        await bloquearUsuario(userId, !bloqueado);
        
        // Actualizar estado local
        setUsuarios(usuarios.map(user => 
          user.id === userId 
            ? { ...user, bloqueado: !bloqueado }
            : user
        ));
        
        alert(`Usuario ${bloqueado ? 'desbloqueado' : 'bloqueado'} exitosamente`);
      } catch (error) {
        console.error('Error al bloquear/desbloquear usuario:', error);
        alert('Error al modificar estado del usuario');
      } finally {
        setUpdatingUser(null);
      }
    }
  };

  const filteredUsers = usuarios.filter(usuario => {
    const matchesSearch = usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (usuario.displayName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'todos' || usuario.userLevel === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-lg p-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span>Cargando panel de administración...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-full md:h-5/6 flex flex-col overflow-auto z-50">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <FaUserShield className="text-2xl text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800">Panel de Administración</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        {/* Estadísticas */}
        <div className="p-6 border-b bg-gray-50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaChartBar className="text-blue-600" />
            Estadísticas de Usuarios
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-lg text-center">
              <div className="text-2xl font-bold text-gray-800">{estadisticas.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            {userLevels.map(nivel => (
              <div key={nivel.key} className={`bg-white p-4 rounded-md shadow-lg text-center`}>
                <div className={`text-2xl font-bold ${nivel.color}`}>
                  {estadisticas[nivel.key] || 0}
                </div>
                <div className="text-sm text-gray-600">{nivel.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Buscar por email o nombre..."
              className="flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
            >
              <option value="todos">Todos los niveles</option>
              {userLevels.map(nivel => (
                <option key={nivel.key} value={nivel.key}>{nivel.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de usuarios */}
        <div className="flex-1 p-6">
          <div className="space-y-4">
            {filteredUsers.map(usuario => (
              <div key={usuario.id} className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex max-md:flex-col max-md:gap-3 items-center justify-between">
                  <div className="flex items-center gap-4">
                    {usuario.photoURL ? (
                      <img 
                        src={usuario.photoURL} 
                        alt="Avatar" 
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <FaUsers className="text-gray-600" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold">{usuario.displayName || 'Sin nombre'}</div>
                      <div className="text-sm text-gray-600">{usuario.email}</div>
                      <div className="text-xs text-gray-500">
                        Registro: {formatDate(usuario.createdAt)} | 
                        Último login: {formatDate(usuario.lastLogin)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Indicador de estado bloqueado */}
                    {usuario.bloqueado && (
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                        Bloqueado
                      </span>
                    )}

                    {/* Nivel actual */}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      userLevels.find(n => n.key === usuario.userLevel)?.bg || 'bg-gray-100'
                    } ${userLevels.find(n => n.key === usuario.userLevel)?.color || 'text-gray-600'}`}>
                      {userLevels.find(n => n.key === usuario.userLevel)?.label || 'Básico'}
                    </span>

                    {/* Selector de nivel */}
                    <select
                      className="px-3 py-1 border rounded-md text-sm focus:ring-2 focus:ring-purple-500"
                      value={usuario.userLevel || 'básico'}
                      onChange={(e) => handleUpdateLevel(usuario.id, e.target.value)}
                      disabled={updatingUser === usuario.id}
                    >
                      {userLevels.map(nivel => (
                        <option key={nivel.key} value={nivel.key}>
                          {nivel.label}
                        </option>
                      ))}
                    </select>

                    {/* Botón de bloquear/desbloquear */}
                    {usuario.id !== currentUser.uid && (
                      <button
                        onClick={() => handleBloquearUsuario(usuario.id, usuario.email, usuario.bloqueado)}
                        disabled={updatingUser === usuario.id}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          usuario.bloqueado 
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : 'bg-yellow-500 text-white hover:bg-yellow-600'
                        } ${updatingUser === usuario.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={usuario.bloqueado ? 'Desbloquear usuario' : 'Bloquear usuario'}
                      >
                        {usuario.bloqueado ? <FaCheck size={14} /> : <FaBan size={14} />}
                      </button>
                    )}

                    {/* Botón de eliminar */}
                    {usuario.id !== currentUser.uid && (
                      <button
                        onClick={() => handleEliminarUsuario(usuario.id, usuario.email)}
                        disabled={updatingUser === usuario.id}
                        className={`px-3 py-1 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors ${
                          updatingUser === usuario.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title="Eliminar usuario"
                      >
                        <FaTrash size={14} />
                      </button>
                    )}

                    {updatingUser === usuario.id && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <FaUsers className="mx-auto text-4xl text-gray-400 mb-4" />
              <p className="text-gray-500">No se encontraron usuarios</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
