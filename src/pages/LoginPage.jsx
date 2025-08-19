/**
 * @fileoverview Página de inicio de sesión para El Predicador Católico
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Permite a los usuarios iniciar sesión usando correo y contraseña.
 *
 * @usage
 * <LoginPage />
 */
import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { login } from '../services/auth/authService';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { dispatch } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_ERROR', payload: null });
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciales incorrectas o error de conexión');
      dispatch({ type: 'SET_ERROR', payload: err });
    }
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      <nav>
        <Link to="/">Inicio</Link> |{' '}
        <Link to="/register">Registrarse</Link>
      </nav>
      <form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Button type="submit">Entrar</Button>
      </form>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
};

export default LoginPage;
