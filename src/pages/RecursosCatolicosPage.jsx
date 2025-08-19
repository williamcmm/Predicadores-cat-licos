/**
 * @fileoverview Página de acceso a recursos católicos
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Permite consultar recursos doctrinales y herramientas de investigación.
 *
 * @usage
 * <RecursosCatolicosPage />
 */
import React from 'react';
import RecursosCatolicosList from '../components/feature/RecursosCatolicosList';
import BusquedaRecursosCatolicos from '../components/feature/BusquedaRecursosCatolicos';
import RecursosFavoritos from '../components/feature/RecursosFavoritos';
import ThemeToggle from '../components/ui/ThemeToggle';

const RecursosCatolicosPage = () => {
  return (
    <div>
  <h2>Recursos Católicos</h2>
  <ThemeToggle />
  <p>Accede a documentos, lecturas y herramientas de investigación.</p>
  <RecursosCatolicosList />
  <BusquedaRecursosCatolicos />
  <RecursosFavoritos userId={window?.AppContext?.user?.uid || 'anon'} />
    </div>
  );
};

export default RecursosCatolicosPage;
