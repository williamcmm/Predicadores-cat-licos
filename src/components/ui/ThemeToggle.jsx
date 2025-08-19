/**
 * @fileoverview Componente para alternar entre modo claro y oscuro
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Permite al usuario cambiar el tema visual de la app.
 *
 * @usage
 * <ThemeToggle />
 */
import React, { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} style={{margin:'8px 0',padding:'6px 12px'}}>
      {theme === 'light' ? '🌙 Modo Oscuro' : '☀️ Modo Claro'}
    </button>
  );
};

export default ThemeToggle;
