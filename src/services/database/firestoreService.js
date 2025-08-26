// Servicio para guardar y recuperar sermones en Firestore
import app from '../../config/firebase';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';

const db = getFirestore();

export async function guardarSermon(sermon) {
  try {
    const docRef = await addDoc(collection(db, 'sermones'), sermon);
    return docRef.id;
  } catch (error) {
    throw error;
  }
}

export async function obtenerSermones(userId) {
  try {
    if (!userId) {
      return [];
    }
    const q = query(collection(db, "sermones"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
}

export async function eliminarSermon(sermonId) {
  try {
    const sermonRef = doc(db, 'sermones', sermonId);
    await deleteDoc(sermonRef);
  } catch (error) {
    throw error;
  }
}

