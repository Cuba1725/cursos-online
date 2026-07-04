// ============================================================
// CourseList Component - Lista de Cursos Disponibles
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../hooks/useAuth';

export default function CourseList() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const cargarCursos = async () => {
      try {
        const cursosRef = collection(db, 'courses');
        const q = query(cursosRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const cursosCargados = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setCursos(cursosCargados);
      } catch (error) {
        console.error('Error al cargar cursos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    cargarCursos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mis Cursos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Seleccioná un curso para comenzar a aprender
          </p>
        </div>

        {cursos.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No hay cursos disponibles
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Los cursos aparecerán aquí cuando estén disponibles
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cursos.map((curso) => (
              <Link
                key={curso.id}
                to={`/courses/${curso.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {curso.imageUrl ? (
                  <img
                    src={curso.imageUrl}
                    alt={curso.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                    <span className="text-6xl">📚</span>
                  </div>
                )}
                
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {curso.title}
                  </h3>
                  
                  {curso.professorName && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Profesor: {curso.professorName}
                    </p>
                  )}
                  
                  {curso.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {curso.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      📖 Ver curso
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
