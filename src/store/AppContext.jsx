/**
 * @fileoverview Contexto global y manejador de estado principal
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Proporciona el contexto global y el manejador de estado con useReducer para la app.
 *
 * @usage
 * <AppProvider> ... </AppProvider>
 * const { state, dispatch } = useAppContext();
 */
import React, { createContext, useReducer, useContext } from 'react';

const initialState = {
  user: null,
  loading: false,
  error: null,
  notificacion: { mensaje: '', tipo: 'info' },
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'SET_NOTIFICACION':
      return { ...state, notificacion: action.payload };
    case 'CLEAR_NOTIFICACION':
      return { ...state, notificacion: { mensaje: '', tipo: 'info' } };
    default:
      return state;
  }
}

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
