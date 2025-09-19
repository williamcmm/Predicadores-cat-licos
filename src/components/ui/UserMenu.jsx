import React, { useState, useRef, useEffect } from "react";
import { FaUser, FaSignOutAlt, FaCog } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import UserLevelBadge from "./UserLevelBadge";
import { useAccessControl } from "../../hooks/useAccessControl";

const UserMenu = ({ onOpenAdminPanel }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const { currentUser, logout } = useAuth();
  const { hasAccess } = useAccessControl();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();

      setShowMenu(false);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleAdminPanel = () => {
    if (onOpenAdminPanel) {
      onOpenAdminPanel();
    }
    setShowMenu(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-2 text-white hover:text-purple-200 transition-colors duration-200 p-2"
        aria-label="Menu de usuario"
      >
        <FaCog size={18} />
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Información del usuario */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center">
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || currentUser.email}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="text-purple-600" size={16} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser?.displayName || currentUser?.email || "Usuario"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser?.email}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <UserLevelBadge userId={currentUser?.uid} />
            </div>
          </div>

          {/* Opciones del menú */}
          <div className="py-2">
            {hasAccess.adminPanel && (
              <button
                onClick={handleAdminPanel}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
              >
                <FaCog className="mr-3 text-gray-400" size={16} />
                Panel de Administrador
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
            >
              <FaSignOutAlt className="mr-3 text-gray-400" size={16} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
