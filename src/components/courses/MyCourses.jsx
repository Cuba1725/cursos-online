// ============================================================
// MyCourses Component - Mis Cursos (Alumnos)
// ============================================================
// Muestra SOLO los cursos que el alumno ya ha accedido
// Los cursos se guardan cuando el alumno accede por link compartido
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../hooks/useAuth';

export default function MyCourses() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const cargarMisCursos = async () => {
      if (!user) return;
      
      try {
        // Obtener todos los progresos del usuario
        const progresoRef = collection(db, 'userProgress', user.uid, 'courses');
        const progresoSnapshot = await getDocs(progresoRef);
        
        const cursosCargados = [];
        
        for (const progresoDoc of progresoSnapshot.docs) {
          const progresoData = progresoDoc.data();
          const cursoId = progresoDoc.id;
          
          // Obtener información del curso
          const cursoRef = doc(db, 'courses', cursoId);
          const cursoDoc = await getDoc(cursoRef);
          
          if (cursoDoc.exists()) {
            // Calcular progreso
            const unidadesRef = collection(db, 'courses', cursoId, 'units');
            const unidadesSnapshot = await getDocs(unidadesRef);
            const totalUnidades = unidadesSnapshot.size;
            const unidadesCompletadas = progresoData.unidadesCompletadas?.length || 0;
            const porcentaje = totalUnidades > 0 ? Math.round((unidadesCompletadas / totalUnidades) * 100) : 0;
            
            cursosCargados.push({
              id: cursoId,
              ...cursoDoc.data(),
              totalUnidades,
              unidadesCompletadas,
              porcentaje,
              ultimoAcceso: progresoData.ultimoAcceso,
              accessedAt: progresoData.accessedAt,
            });
          }
        }
        
        // Ordenar por último acceso (más reciente primero)
        cursosCargados.sort((a, b) => {
          const fechaA = a.ultimoAcceso?.toDate?.() || new Date(0);
          const fechaB = b.ultimoAcceso?.toDate?.() || new Date(0);
          return fechaB - fechaA;
        });
        
        setCursos(cursosCargados);
      } catch (error) {
        console.error('Error al cargar mis cursos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    cargarMisCursos();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando tus cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Mis Cursos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Continuá aprendiendo desde donde lo dejaste
          </p>
        </div>

        {/* Lista de cursos */}
        {cursos.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Todavía no tenés cursos
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Pedile el link a tu profesor para acceder a tu primer curso
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                💡 <strong>Tip:</strong> Tu profesor te va a dar un link que empieza con <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">/share/...</code>
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cursos.map((curso) => (
              <Link
                key={curso.id}
                to={`/share/${curso.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {curso.imageUrl ? (
                  <img
                    src={curso.imageUrl}
                    alt={curso.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                    <span className="text-6xl">📚</span>
                  </div>
                )}
                
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {curso.title}
                  </h3>
                  
                  {curso.professorName && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Profesor: {curso.professorName}
                    </p>
                  )}
                  
                  {/* Barra de progreso */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">
                        {curso.unidadesCompletadas}/{curso.totalUnidades} unidades
                      </span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {curso.porcentaje}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${curso.porcentaje}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {curso.porcentaje === 100 ? '🎉 Completado' : '📖 Continuar'}
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
