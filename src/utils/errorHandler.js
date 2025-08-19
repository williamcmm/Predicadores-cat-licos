/**
 * @fileoverview Sistema centralizado de manejo de errores
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Proporciona funciones para manejar errores de forma uniforme en toda la app.
 *
 * @usage
 * import { ErrorTypes, handleError } from '../utils/errorHandler';
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTH: 'AUTHENTICATION_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

const determineErrorType = (error) => {
  if (error.code && error.code.includes('auth')) return ErrorTypes.AUTH;
  if (error.code && error.code.includes('permission')) return ErrorTypes.PERMISSION;
  if (error.message && error.message.includes('Network')) return ErrorTypes.NETWORK;
  if (error.code && error.code.includes('invalid')) return ErrorTypes.VALIDATION;
  if (error.code && error.code.includes('server')) return ErrorTypes.SERVER;
  return ErrorTypes.UNKNOWN;
};

const getUserFriendlyMessage = (error) => {
  if (error.message) return error.message;
  return 'Ha ocurrido un error inesperado.';
};

export const handleError = (error, context = '') => {
  console.error(`[${context}] Error:`, error);
  return {
    type: determineErrorType(error),
    message: getUserFriendlyMessage(error),
    originalError: error,
    context,
    timestamp: new Date().toISOString()
  };
};
