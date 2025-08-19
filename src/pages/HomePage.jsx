/**
 * @fileoverview Página principal de la aplicación El Predicador Católico
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Página de bienvenida y acceso a las principales funcionalidades.
 *
 * @usage
 * <HomePage />
 */
import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ui/ThemeToggle';
import FontSizeToggle from '../components/ui/FontSizeToggle';

const HomePage = () => {
  return (
    <div>
      <h1>Bienvenido a El Predicador Católico</h1>
  <ThemeToggle />
  <FontSizeToggle />
      <p>Prepara tus predicaciones y homilías con ayuda de IA y recursos oficiales.</p>
      <nav>
        <Link to="/login">Iniciar Sesión</Link> |{' '}
        <Link to="/register">Registrarse</Link> |{' '}
        <Link to="/dashboard">Panel Principal</Link>
      </nav>
    </div>
  );
};

export default HomePage;
