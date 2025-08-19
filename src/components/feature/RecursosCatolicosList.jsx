/**
 * @fileoverview Listado de recursos católicos básicos
 * @author AI Generated - 19/08/2025
 * @version 1.0.0
 *
 * @description
 * Muestra enlaces a recursos doctrinales y herramientas de investigación.
 *
 * @usage
 * <RecursosCatolicosList />
 */
import React from 'react';

const recursos = [
  {
    nombre: 'Vatican.va',
    url: 'https://www.vatican.va/',
    descripcion: 'Documentos pontificios, encíclicas y constituciones apostólicas.'
  },
  {
    nombre: 'Catecismo de la Iglesia Católica',
    url: 'https://www.vatican.va/archive/catechism_sp/index_sp.html',
    descripcion: 'Texto completo del Catecismo.'
  },
  {
    nombre: 'Código de Derecho Canónico',
    url: 'https://www.vatican.va/archive/cod-iuris-canonici/cic_index_sp.html',
    descripcion: 'Referencia completa para cuestiones canónicas.'
  },
  {
    nombre: 'Liturgia de las Horas',
    url: 'https://www.liturgiadelashoras.com/',
    descripcion: 'Textos litúrgicos oficiales y ciclos completos.'
  },
  {
    nombre: 'Documentos del Vaticano II',
    url: 'https://www.vatican.va/archive/hist_councils/ii_vatican_council/index_sp.htm',
    descripcion: 'Constituciones, decretos y declaraciones.'
  }
];

const RecursosCatolicosList = () => (
  <ul>
    {recursos.map((r, idx) => (
      <li key={idx}>
        <a href={r.url} target="_blank" rel="noopener noreferrer">
          <strong>{r.nombre}</strong>
        </a>: {r.descripcion}
      </li>
    ))}
  </ul>
);

export default RecursosCatolicosList;
