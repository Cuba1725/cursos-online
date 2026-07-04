// ============================================================
// UnitContent Component - Contenido de la Unidad
// ============================================================

export default function UnitContent({
  unidad,
  unidadesCompletadas,
  marcarUnidad,
  marcandoUnidad,
  estaDesbloqueada,
  totalUnidades,
}) {
  if (!unidad) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-400 text-6xl mb-4">📚</div>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Selecciona una unidad
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Elige una unidad del menú lateral para comenzar a aprender
        </p>
      </div>
    );
  }

  if (!estaDesbloqueada(unidad.id)) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-400 text-6xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Unidad Bloqueada
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Completa la unidad anterior para desbloquear este contenido
        </p>
      </div>
    );
  }

  function convertirUrlVideo(url) {
    if (url.includes('embed/')) return url;
    
    let videoId = '';
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(new URL(url).search);
      videoId = urlParams.get('v');
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }

  const renderContenido = () => {
    switch (unidad.tipo) {
      case 'texto':
        return (
          <div className="prose max-w-none">
            <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {unidad.contenido}
            </div>
          </div>
        );

      case 'imagen':
        return (
          <div className="text-center">
            {unidad.imageUrl && (
              <img
                src={unidad.imageUrl}
                alt={unidad.title}
                className="content-image mx-auto"
                loading="lazy"
              />
            )}
            {unidad.contenido && (
              <p className="mt-4 text-gray-600 dark:text-gray-400 italic">
                {unidad.contenido}
              </p>
            )}
          </div>
        );

      case 'video':
        return (
          <div>
            {unidad.videoUrl && (
              <div className="video-container rounded-lg overflow-hidden">
                <iframe
                  src={convertirUrlVideo(unidad.videoUrl)}
                  title={unidad.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
            {unidad.contenido && (
              <div className="mt-4 text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {unidad.contenido}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            {unidad.contenido}
          </div>
        );
    }
  };

  const completada = unidadesCompletadas.includes(unidad.id);
  const esUltimaUnidad = unidad.orden === totalUnidades;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>Unidad {unidad.orden}</span>
          <span>•</span>
          <span className="capitalize">{unidad.tipo}</span>
          {completada && (
            <>
              <span>•</span>
              <span className="text-green-600 dark:text-green-400 font-medium">✅ Completada</span>
            </>
          )}
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {unidad.title}
        </h1>
      </div>

      {/* Contenido */}
      <div className="p-4 sm:p-6">
        {renderContenido()}
      </div>

      {/* Botón de avance */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        {!completada ? (
          <button
            onClick={() => marcarUnidad(unidad.id)}
            disabled={marcandoUnidad}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {marcandoUnidad ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                Marcar como leído y continuar
                {!esUltimaUnidad && ' →'}
              </>
            )}
          </button>
        ) : (
          <div className="text-center text-green-600 dark:text-green-400 font-medium">
            {esUltimaUnidad ? (
              <span>🎉 ¡Has completado todas las unidades del curso!</span>
            ) : (
              <span>✅ Unidad completada - Selecciona la siguiente unidad</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
