/**
 * @fileoverview Componente principal de la aplicación con navegación
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Configura las rutas principales usando React Router DOM.
 *
 * @usage
 * <App />
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NuevaPredicacionPage from './pages/NuevaPredicacionPage';
import MisPredicacionesPage from './pages/MisPredicacionesPage';
import RecursosCatolicosPage from './pages/RecursosCatolicosPage';
import CuentaPage from './pages/CuentaPage';
import { AppProvider, useAppContext } from './store/AppContext';
import NotificacionGlobal from './components/ui/NotificacionGlobal';

const AppContent = () => {
  const { state, dispatch } = useAppContext();
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/predicacion/nueva" element={<NuevaPredicacionPage />} />
          <Route path="/predicaciones" element={<MisPredicacionesPage />} />
          <Route path="/recursos" element={<RecursosCatolicosPage />} />
          <Route path="/cuenta" element={<CuentaPage />} />
        </Routes>
      </Router>
      <NotificacionGlobal
        mensaje={state.notificacion.mensaje}
        tipo={state.notificacion.tipo}
        onClose={() => dispatch({ type: 'CLEAR_NOTIFICACION' })}
      />
    </>
  );
};

const App = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
