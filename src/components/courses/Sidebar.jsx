// ============================================================
// Sidebar Component - Barra Lateral de Unidades
// ============================================================
// Responsivo: colapsable en móvil, siempre visible en desktop
// Dark mode support
// ============================================================

import { useState } from 'react';

export default function Sidebar({
  unidades,
  unidadesCompletadas,
  unidadActual,
  setUnidadActual,
  estaDesbloqueada,
}) {
  const [expanded, setExpanded] = useState(false);

  const getIconoUnidad = (unidad) => {
    const completada = unidadesCompletadas.includes(unidad.id);
    const desbloqueada = estaDesbloqueada(unidad.id);
    
    if (completada) return <span className="text-lg">✅</span>;
    if (desbloqueada) return <span className="text-lg">📖</span>;
    return <span className="text-lg">🔒</span>;
  };

  const getClasesUnidad = (unidad) => {
    const completada = unidadesCompletadas.includes(unidad.id);
    const desbloqueada = estaDesbloqueada(unidad.id);
    const esActual = unidadActual === unidad.id;
    
    let clases = 'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200';
    
    if (completada) {
      clases += ' unit-completed hover:bg-green-200 dark:hover:bg-green-900/50';
    } else if (desbloqueada) {
      clases += esActual ? ' unit-active' : ' hover:bg-gray-100 dark:hover:bg-gray-700';
    } else {
      clases += ' unit-locked bg-gray-50 dark:bg-gray-800/50';
    }
    
    return clases;
  };

  const handleUnidadClick = (unidad) => {
    if (estaDesbloqueada(unidad.id)) {
      setUnidadActual(unidad.id);
      setExpanded(false);
    }
  };

  // Contador de unidades completadas
  const completadas = unidades.filter(u => unidadesCompletadas.includes(u.id)).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Header - siempre visible */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Unidades
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {completadas}/{unidades.length}
          </span>
        </div>
        
        {/* Botón toggle - solo visible en móvil */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors md:hidden"
        >
          {expanded ? 'Ocultar unidades' : 'Ver unidades'}
        </button>
      </div>

      {/* Lista de unidades */}
      <div className={`p-2 space-y-1 ${expanded ? 'block' : 'hidden md:block'}`}>
        {unidades.map((unidad) => {
          const completada = unidadesCompletadas.includes(unidad.id);
          const desbloqueada = estaDesbloqueada(unidad.id);
          
          return (
            <div
              key={unidad.id}
              className={getClasesUnidad(unidad)}
              onClick={() => handleUnidadClick(unidad)}
              role="button"
              tabIndex={desbloqueada ? 0 : -1}
              aria-disabled={!desbloqueada}
            >
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 w-6">
                {unidad.orden}
              </span>
              
              {getIconoUnidad(unidad)}
              
              <span className={`flex-1 text-sm ${
                !desbloqueada ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'
              }`}>
                {unidad.title}
              </span>
            </div>
          );
        })}

        {unidades.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>No hay unidades disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
}
