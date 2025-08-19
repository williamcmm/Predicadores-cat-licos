/**
 * @fileoverview Servicio de autenticación con Firebase
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Proporciona funciones para registro, login y logout de usuarios usando Firebase Auth.
 *
 * @dependencies
 * - firebase/auth
 * - src/config/firebase.js
 *
 * @usage
 * import { register, login, logout } from './authService';
 */
import { auth } from '../../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { handleError } from '../../utils/errorHandler';

export const register = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw handleError(error, 'authService.register');
  }
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw handleError(error, 'authService.login');
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    throw handleError(error, 'authService.logout');
  }
};
