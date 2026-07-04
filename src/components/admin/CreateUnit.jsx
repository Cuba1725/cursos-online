// ============================================================
// CreateUnit Component - Formulario de Creación de Unidad
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

export default function CreateUnit() {
  const { courseId } = useParams();
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('texto');
  const [contenido, setContenido] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [orden, setOrden] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cargarCursoYOrden = async () => {
      try {
        const unitsRef = collection(db, 'courses', courseId, 'units');
        const q = query(unitsRef, orderBy('orden', 'desc'), limit(1));
        const snapshot = await getDocs(q);
        setOrden(snapshot.empty ? 1 : snapshot.docs[0].data().orden + 1);
      } catch (error) {
        console.error('Error al cargar curso:', error);
      }
    };
    cargarCursoYOrden();
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!titulo.trim()) { setError('El título es obligatorio'); setLoading(false); return; }
    if (!contenido.trim()) { setError('El contenido es obligatorio'); setLoading(false); return; }
    if (tipo === 'imagen' && imageUrl && !isValidUrl(imageUrl)) { setError('La URL de la imagen no es válida'); setLoading(false); return; }
    if (tipo === 'video' && videoUrl && !isValidUrl(videoUrl)) { setError('La URL del video no es válida'); setLoading(false); return; }
    
    try {
      await addDoc(collection(db, 'courses', courseId, 'units'), {
        title: titulo.trim(),
        tipo,
        contenido: contenido.trim(),
        imageUrl: tipo === 'imagen' ? (imageUrl.trim() || null) : null,
        videoUrl: tipo === 'video' ? (videoUrl.trim() || null) : null,
        orden,
        createdAt: Timestamp.now(),
      });
      
      if (window.confirm('Unidad creada. ¿Agregar otra?')) {
        setTitulo(''); setContenido(''); setImageUrl(''); setVideoUrl('');
        setOrden(orden + 1);
      } else {
        navigate('/admin');
      }
    } catch (error) {
      console.error('Error al crear unidad:', error);
      setError('Error al crear la unidad.');
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (string) => {
    try { new URL(string); return true; } catch (_) { return false; }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to="/admin" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm">
            ← Volver al Panel de Administración
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-2">
            Agregar Unidad #{orden}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="card">
          {error && (
            <div className="mb-6 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="titulo" className="label-field">
                Título <span className="text-red-500">*</span>
              </label>
              <input id="titulo" type="text" className="input-field" placeholder="Ej: Introducción a React" value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={100} />
            </div>

            <div>
              <label className="label-field">Tipo de Contenido <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'texto', icon: '📝', label: 'Texto' },
                  { value: 'imagen', icon: '🖼️', label: 'Imagen' },
                  { value: 'video', icon: '🎥', label: 'Video' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setTipo(item.value)}
                    className={`p-3 sm:p-4 rounded-lg border-2 transition-all text-center ${
                      tipo === item.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="text-xl sm:text-2xl mb-1">{item.icon}</div>
                    <div className="font-medium text-sm">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="contenido" className="label-field">
                {tipo === 'imagen' ? 'Caption' : tipo === 'video' ? 'Descripción' : 'Contenido'} <span className="text-red-500">*</span>
              </label>
              <textarea id="contenido" rows={6} className="input-field" placeholder={tipo === 'imagen' ? 'Pie de foto...' : tipo === 'video' ? 'Describe el video...' : 'Escribe el contenido...'} value={contenido} onChange={(e) => setContenido(e.target.value)} />
            </div>

            {tipo === 'imagen' && (
              <div>
                <label htmlFor="imageUrl" className="label-field">URL de Imagen <span className="text-red-500">*</span></label>
                <input id="imageUrl" type="url" className="input-field" placeholder="https://ejemplo.com/imagen.jpg" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                {imageUrl && isValidUrl(imageUrl) && (
                  <div className="mt-3"><img src={imageUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg" onError={(e) => { e.target.style.display = 'none'; }} /></div>
                )}
              </div>
            )}

            {tipo === 'video' && (
              <div>
                <label htmlFor="videoUrl" className="label-field">URL del Video (YouTube) <span className="text-red-500">*</span></label>
                <input id="videoUrl" type="url" className="input-field" placeholder="https://www.youtube.com/watch?v=..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Soporta URLs de YouTube</p>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-8">
            <Link to="/admin" className="flex-1 btn-secondary text-center">Cancelar</Link>
            <button type="submit" disabled={loading} className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Guardando...' : 'Guardar Unidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
