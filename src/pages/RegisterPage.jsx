/**
 * @fileoverview Página de registro de usuario para El Predicador Católico
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Permite a los usuarios crear una cuenta usando correo y contraseña.
 *
 * @usage
 * <RegisterPage />
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { register } from '../services/auth/authService';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(email, password);
      setSuccess(true);
      setError(null);
      // Redirigir a Home o Login si lo prefieres
    } catch (err) {
      setError('No se pudo registrar. Verifica los datos o la conexión.');
      setSuccess(false);
    }
  };

  return (
    <div>
      <h2>Registro de Usuario</h2>
      <nav>
        <Link to="/">Inicio</Link> |{' '}
        <Link to="/login">Iniciar Sesión</Link>
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
        <Button type="submit">Registrarse</Button>
      </form>
      {error && <p style={{color: 'red'}}>{error}</p>}
      {success && <p style={{color: 'green'}}>¡Registro exitoso! Ahora puedes iniciar sesión.</p>}
    </div>
  );
};

export default RegisterPage;
