/**
 * @fileoverview Página para preparar una nueva predicación
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Permite al usuario iniciar la creación de una nueva predicación.
 *
 * @usage
 * <NuevaPredicacionPage />
 */
import React from 'react';
import NuevaPredicacionForm from '../components/forms/NuevaPredicacionForm';
import { crearPredicacion } from '../services/database/firestoreService';

const NuevaPredicacionPage = () => {
  return (
    <div>
  <h2>Preparar Nueva Predicación</h2>
  <p>Aquí podrás crear y estructurar tu predicación con ayuda de IA.</p>
      <NuevaPredicacionForm onSubmit={async data => {
        try {
          // Obtener el userId del contexto global o auth
          const userId = window?.AppContext?.user?.uid || 'anon';
          const id = await crearPredicacion(data, userId);
          alert('Predicación creada con éxito. ID: ' + id);
        } catch (error) {
          alert('Error al crear la predicación: ' + (error.message || 'Error desconocido'));
        }
      }} />
    </div>
  );
};

export default NuevaPredicacionPage;
