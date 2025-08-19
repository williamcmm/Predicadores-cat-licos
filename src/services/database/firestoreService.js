/**
 * Crea una nueva predicación en Firestore, incluyendo disparadores mentales y notas personales.
 * @param {Object} predicacion - Datos de la predicación.
 * @param {string} userId - ID del usuario creador.
 * @returns {Promise<string>} ID del documento creado.
 */
export const crearPredicacion = async (predicacion, userId) => {
  try {
    const docRef = await addDoc(collection(db, 'predicaciones'), {
      ...predicacion,
      disparadores: predicacion.disparadores || [],
      notas: predicacion.notas || [],
      userId,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    throw handleError(error, 'firestoreService.crearPredicacion');
  }
};
/**
 * @fileoverview Servicio para operaciones con Firestore
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Proporciona funciones para crear, leer, actualizar y eliminar documentos en Firestore.
 *
 * @dependencies
 * - firebase/firestore
 * - src/config/firebase.js
 *
 * @usage
 * import { addDoc, getDocById, updateDocById, deleteDocById } from './firestoreService';
 */
import { db } from '../../config/firebase';
import { collection, addDoc, getDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { handleError } from '../../utils/errorHandler';

export const addDocument = async (collectionName, data) => {
  try {
    const colRef = collection(db, collectionName);
    const docRef = await addDoc(colRef, data);
    return docRef.id;
  } catch (error) {
    throw handleError(error, 'firestoreService.addDocument');
  }
};

export const getDocumentById = async (collectionName, id) => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    throw handleError(error, 'firestoreService.getDocumentById');
  }
};

export const updateDocumentById = async (collectionName, id, data) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
    return true;
  } catch (error) {
    throw handleError(error, 'firestoreService.updateDocumentById');
  }
};

export const deleteDocumentById = async (collectionName, id) => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    throw handleError(error, 'firestoreService.deleteDocumentById');
  }
};
