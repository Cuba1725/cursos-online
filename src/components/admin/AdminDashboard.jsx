// ============================================================
// AdminDashboard Component - Panel de Administración
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc,
} from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../hooks/useAuth';

export default function AdminDashboard() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [cursoCopiado, setCursoCopiado] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const cargarCursos = async () => {
      if (!user) return;
      try {
        const cursosRef = collection(db, 'courses');
        const q = query(cursosRef, where('createdBy', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const cursosCargados = [];
        for (const cursoDoc of querySnapshot.docs) {
          const unidadesRef = collection(db, 'courses', cursoDoc.id, 'units');
          const unidadesSnapshot = await getDocs(unidadesRef);
          cursosCargados.push({
            id: cursoDoc.id,
            ...cursoDoc.data(),
            totalUnidades: unidadesSnapshot.size,
          });
        }
        setCursos(cursosCargados);
      } catch (error) {
        console.error('Error al cargar cursos:', error);
        setMensaje({ tipo: 'error', texto: 'Error al cargar los cursos' });
      } finally {
        setLoading(false);
      }
    };
    cargarCursos();
  }, [user]);

  const copiarLinkCurso = async (cursoId) => {
    const link = `${window.location.origin}/share/${cursoId}`;
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
    setCursoCopiado(cursoId);
    setTimeout(() => setCursoCopiado(null), 2000);
  };

  const eliminarCurso = async (cursoId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este curso?')) return;
    try {
      const unidadesRef = collection(db, 'courses', cursoId, 'units');
      const unidadesSnapshot = await getDocs(unidadesRef);
      for (const unidadDoc of unidadesSnapshot.docs) {
        await deleteDoc(doc(db, 'courses', cursoId, 'units', unidadDoc.id));
      }
      await deleteDoc(doc(db, 'courses', cursoId));
      setCursos(cursos.filter(c => c.id !== cursoId));
      setMensaje({ tipo: 'exito', texto: 'Curso eliminado correctamente' });
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
    } catch (error) {
      console.error('Error al eliminar curso:', error);
      setMensaje({ tipo: 'error', texto: 'Error al eliminar el curso' });
    }
  };

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
        {/* Header responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Panel de Administración
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestiona tus cursos y contenido educativo
            </p>
          </div>
          <Link to="/admin/create-course" className="btn-primary whitespace-nowrap">
            + Crear Curso
          </Link>
        </div>

        {/* Mensaje de feedback */}
        {mensaje.texto && (
          <div className={`mb-6 px-4 py-3 rounded-lg ${
            mensaje.tipo === 'exito' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-400 dark:border-green-700' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-400 dark:border-red-700'
          }`}>
            {mensaje.texto}
          </div>
        )}

        {/* Lista de cursos */}
        {cursos.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No tienes cursos creados
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Comienza creando tu primer curso para compartir conocimiento
            </p>
            <Link to="/admin/create-course" className="btn-primary">
              Crear Mi Primer Curso
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cursos.map((curso) => (
              <div
                key={curso.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {curso.imageUrl && (
                  <img src={curso.imageUrl} alt={curso.title} className="w-full h-40 object-cover" />
                )}
                
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {curso.title}
                  </h3>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    📖 {curso.totalUnidades} unidades
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => copiarLinkCurso(curso.id)}
                      className={`w-full text-sm py-2 px-4 rounded-lg transition-colors ${
                        cursoCopiado === curso.id
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-400 dark:border-green-700'
                          : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      {cursoCopiado === curso.id ? '✓ Link Copiado' : '🔗 Copiar Link'}
                    </button>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/admin/course/${curso.id}/add-unit`)}
                        className="flex-1 btn-secondary text-sm"
                      >
                        Agregar Unidad
                      </button>
                      <button
                        onClick={() => eliminarCurso(curso.id)}
                        className="btn-danger text-sm px-3"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
