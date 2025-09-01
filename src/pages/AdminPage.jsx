import React, { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import useAccessControl from '../hooks/useAccessControl';

const AdminPage = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const { hasAccess } = useAccessControl();
  const db = getFirestore();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, 'users');
      let usersQuery;

      switch (sortBy) {
        case 'recent':
          usersQuery = query(usersCollection, orderBy('lastLogin', 'desc'));
          break;
        case 'name':
          usersQuery = query(usersCollection, orderBy('displayName', 'asc'));
          break;
        case 'email':
          usersQuery = query(usersCollection, orderBy('email', 'asc'));
          break;
        default:
          usersQuery = usersCollection;
      }

      const userSnapshot = await getDocs(usersQuery);
      let usersList = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filtrar por nivel si se especifica
      if (filterLevel !== 'all') {
        usersList = usersList.filter(user => 
          (user.membershipLevel || 0) === parseInt(filterLevel)
        );
      }

      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, [db, sortBy, filterLevel]);

  useEffect(() => {
    if (hasAccess.adminPanel) {
      loadUsers();
    }
  }, [hasAccess.adminPanel, loadUsers]);

  const updateUserLevel = async (userId, newLevel) => {
    setUpdating(userId);
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        membershipLevel: newLevel,
        lastUpdated: new Date().toISOString()
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, membershipLevel: newLevel } : user
      ));
      
      alert(`Usuario actualizado a Nivel ${newLevel}`);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error al actualizar usuario');
    } finally {
      setUpdating(null);
    }
  };

  const getLevelName = (level) => {
    const levels = {
      0: 'Visitante',
      1: 'Miembro Nivel 1',
      2: 'Miembro Nivel 2', 
      3: 'Miembro Nivel 3'
    };
    return levels[level] || 'Desconocido';
  };

  const getLevelColor = (level) => {
    const colors = {
      0: 'bg-gray-100 text-gray-800',
      1: 'bg-blue-100 text-blue-800',
      2: 'bg-green-100 text-green-800',
      3: 'bg-purple-100 text-purple-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const filteredUsers = users.filter(user => 
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Si no es admin, mostrar acceso denegado
  if (!hasAccess.adminPanel) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-auto">
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-gray-600 mt-1">Gestiona usuarios y niveles de acceso</p>
              </div>
              <div className="mt-4 md:mt-0">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mr-2"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => window.open('/', '_blank')}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Nueva Pestaña
                </button>
              </div>
            </div>
          </div>

          {/* Filtros y Búsqueda */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Usuario
                </label>
                <input
                  type="text"
                  placeholder="Nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Nivel
                </label>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todos los niveles</option>
                  <option value="0">Visitantes (Nivel 0)</option>
                  <option value="1">Miembros Nivel 1</option>
                  <option value="2">Miembros Nivel 2</option>
                  <option value="3">Miembros Nivel 3</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="recent">Último login</option>
                  <option value="name">Nombre</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={loadUsers}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Actualizar Lista
                </button>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Usuarios</h3>
              <p className="text-3xl font-bold text-blue-600">{users.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Visitantes</h3>
              <p className="text-3xl font-bold text-gray-600">
                {users.filter(u => (u.membershipLevel || 0) === 0).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Miembros</h3>
              <p className="text-3xl font-bold text-green-600">
                {users.filter(u => (u.membershipLevel || 0) >= 1).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium</h3>
              <p className="text-3xl font-bold text-purple-600">
                {users.filter(u => (u.membershipLevel || 0) === 3).length}
              </p>
            </div>
          </div>

          {/* Lista de Usuarios */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                Usuarios ({filteredUsers.length})
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando usuarios...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nivel Actual
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Último Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.photoURL && (
                              <img 
                                src={user.photoURL} 
                                alt={user.displayName}
                                className="w-10 h-10 rounded-full mr-3"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.displayName || 'Sin nombre'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getLevelColor(user.membershipLevel || 0)}`}>
                            {getLevelName(user.membershipLevel || 0)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Nunca'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {[0, 1, 2, 3].map(level => (
                              <button
                                key={level}
                                onClick={() => updateUserLevel(user.id, level)}
                                disabled={updating === user.id || user.membershipLevel === level}
                                className={`px-3 py-1 text-xs rounded font-medium transition-colors
                                  ${user.membershipLevel === level 
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                  }
                                  ${updating === user.id ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                              >
                                {updating === user.id ? '...' : `N${level}`}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No se encontraron usuarios</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
