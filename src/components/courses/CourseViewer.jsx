// ============================================================
// CourseViewer Component - Visor Principal de Cursos
// ============================================================
// Soporta dos modos:
// - Público (/share/:courseId): alumnos ven contenido, login para avanzar
// - Autenticado (/courses/:courseId): profesores revisan su curso
//
// NUEVO: Guarda el curso en "Mis Cursos" del alumno cuando accede
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../hooks/useAuth';
import { useProgress } from '../../hooks/useProgress';
import Sidebar from './Sidebar';
import UnitContent from './UnitContent';

export default function CourseViewer({ publicMode = false }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [curso, setCurso] = useState(null);
  const [loadingCurso, setLoadingCurso] = useState(true);
  const [copiado, setCopiado] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const {
    unidades,
    unidadesCompletadas,
    unidadActual,
    setUnidadActual,
    loading: loadingProgress,
    estaDesbloqueada,
    marcarUnidad,
    marcandoUnidad,
    guardarCursoEnMisCursos,
    obtenerProgreso,
    cursoCompletado,
  } = useProgress(user?.uid, courseId);

  // Cargar información del curso
  useEffect(() => {
    const cargarCurso = async () => {
      if (!courseId) return;
      try {
        const cursoRef = doc(db, 'courses', courseId);
        const cursoDoc = await getDoc(cursoRef);
        if (cursoDoc.exists()) {
          setCurso({ id: cursoDoc.id, ...cursoDoc.data() });
        }
      } catch (error) {
        console.error('Error al cargar curso:', error);
      } finally {
        setLoadingCurso(false);
      }
    };
    cargarCurso();
  }, [courseId]);

  // NUEVO: Guardar curso en "Mis Cursos" cuando el alumno accede
  useEffect(() => {
    if (user && curso && publicMode) {
      guardarCursoEnMisCursos({
        title: curso.title,
        imageUrl: curso.imageUrl,
        professorName: curso.professorName,
      });
    }
  }, [user, curso, publicMode, guardarCursoEnMisCursos]);

  // Copiar link
  const copiarLink = async () => {
    const link = `${window.location.origin}/share/${courseId}`;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // Marcar unidad - si no hay usuario, mostrar modal de login
  const handleMarcarUnidad = (unitId) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    marcarUnidad(unitId);
  };

  // Estado de carga
  if (loadingCurso || loadingProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando curso...</p>
        </div>
      </div>
    );
  }

  // Curso no encontrado
  if (!curso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Curso no encontrado
          </h2>
          <Link to={publicMode ? '/login' : '/admin'} className="btn-primary">
            {publicMode ? 'Iniciar Sesión' : 'Volver al Panel Admin'}
          </Link>
        </div>
      </div>
    );
  }

  // Curso completado
  if (cursoCompletado()) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 px-6 py-4 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-2">
              ¡Felicitaciones! Has completado el curso
            </h2>
            <p className="mb-4">"{curso.title}"</p>
            <Link
              to={publicMode ? '/my-courses' : '/admin'}
              className="btn-primary"
            >
              {publicMode ? 'Volver a Mis Cursos' : 'Volver al Panel Admin'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header del curso */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Link
                to={publicMode ? (user ? '/my-courses' : '/login') : '/admin'}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {publicMode ? (user ? '← Volver a Mis Cursos' : '← Soy Profesor') : '← Volver al Panel Admin'}
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1 truncate">
                {curso.title}
              </h1>
              {curso.professorName && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Profesor: {curso.professorName}
                </p>
              )}
              {curso.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {curso.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3 flex-shrink-0">
              {publicMode && (
                <button
                  onClick={copiarLink}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    copiado
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-400 dark:border-green-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {copiado ? '✓ Copiado' : '🔗 Link'}
                </button>
              )}
              
              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Progreso</div>
                <div className="flex items-center gap-2">
                  <div className="w-20 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${obtenerProgreso()}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {obtenerProgreso()}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 flex-shrink-0">
            <Sidebar
              unidades={unidades}
              unidadesCompletadas={unidadesCompletadas}
              unidadActual={unidadActual}
              setUnidadActual={setUnidadActual}
              estaDesbloqueada={estaDesbloqueada}
            />
          </div>

          <div className="flex-1 min-w-0">
            <UnitContent
              unidad={unidades.find(u => u.id === unidadActual)}
              unidadesCompletadas={unidadesCompletadas}
              marcarUnidad={handleMarcarUnidad}
              marcandoUnidad={marcandoUnidad}
              estaDesbloqueada={estaDesbloqueada}
              totalUnidades={unidades.length}
            />
          </div>
        </div>
      </div>

      {/* Modal de Login */}
      {showLoginModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowLoginModal(false)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 z-50 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Iniciá sesión para continuar
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Guardá tu progreso y seguí aprendiendo desde donde lo dejaste.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                className="btn-primary text-center"
                onClick={() => setShowLoginModal(false)}
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/signup"
                className="btn-secondary text-center"
                onClick={() => setShowLoginModal(false)}
              >
                Crear Cuenta
              </Link>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
              >
                Continuar sin guardar progreso
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
