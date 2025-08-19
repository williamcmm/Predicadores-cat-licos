/**
 * @fileoverview Dashboard principal para El Predicador Católico
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Muestra las opciones principales y el acceso a las funcionalidades del sistema.
 *
 * @usage
 * <DashboardPage />
 */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/auth/authService';
import { useAppContext } from '../store/AppContext';
import ThemeToggle from '../components/ui/ThemeToggle';
import FontSizeToggle from '../components/ui/FontSizeToggle';

const DashboardPage = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  return (
    <div>
  <h2>Panel Principal</h2>
  <ThemeToggle />
  <FontSizeToggle />
      {/* Mostrar usuario si está logueado */}
      {state.user && (
        <p>Bienvenido, {state.user.email}</p>
      )}
      <nav>
        <Link to="/">Inicio</Link> |{' '}
        <Link to="/login">Iniciar Sesión</Link> |{' '}
        <Link to="/register">Registrarse</Link>
      </nav>
      <ul>
        <li><Link to="/predicacion/nueva">Preparar nueva predicación</Link></li>
        <li><Link to="/predicaciones">Ver mis predicaciones</Link></li>
        <li><Link to="/recursos">Acceder a recursos católicos</Link></li>
        <li><Link to="/cuenta">Configuración de cuenta</Link></li>
      </ul>
      <button onClick={async () => {
        await logout();
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
      }}>Cerrar sesión</button>
    </div>
  );
};

export default DashboardPage;
