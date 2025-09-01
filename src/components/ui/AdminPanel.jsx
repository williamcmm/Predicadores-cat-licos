import React, { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import useAccessControl from '../../hooks/useAccessControl';

const AdminPanel = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const { hasAccess } = useAccessControl();
  const db = getFirestore();

  const loadUsers = useCallback(async () => {
    try {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const usersList = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, [db]);

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

  // Si no es admin, no mostrar el panel
  if (!hasAccess.adminPanel) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Panel de Administración - Usuarios</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map(user => (
                <div key={user.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center space-x-3 mb-3">
                    {user.photoURL && (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-semibold">{user.displayName}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getLevelColor(user.membershipLevel || 0)}`}>
                      {getLevelName(user.membershipLevel || 0)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700">Cambiar a:</p>
                    <div className="flex flex-wrap gap-1">
                      {[0, 1, 2, 3].map(level => (
                        <button
                          key={level}
                          onClick={() => updateUserLevel(user.id, level)}
                          disabled={updating === user.id || user.membershipLevel === level}
                          className={`px-2 py-1 text-xs rounded font-medium transition-colors
                            ${user.membershipLevel === level 
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                            }
                            ${updating === user.id ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                        >
                          {updating === user.id ? '...' : `Nivel ${level}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {user.lastLogin && (
                    <p className="text-xs text-gray-500 mt-2">
                      Último login: {new Date(user.lastLogin).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {users.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No hay usuarios registrados</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
