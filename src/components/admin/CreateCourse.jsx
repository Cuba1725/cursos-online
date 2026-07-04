// ============================================================
// CreateCourse Component - Formulario de Creación de Curso
// ============================================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../hooks/useAuth';

export default function CreateCourse() {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, userData } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!titulo.trim()) {
      setError('El título es obligatorio');
      setLoading(false);
      return;
    }
    
    if (!descripcion.trim()) {
      setError('La descripción es obligatoria');
      setLoading(false);
      return;
    }
    
    if (imageUrl && !isValidUrl(imageUrl)) {
      setError('La URL de la imagen no es válida');
      setLoading(false);
      return;
    }
    
    try {
      const cursoData = {
        title: titulo.trim(),
        description: descripcion.trim(),
        imageUrl: imageUrl.trim() || null,
        createdBy: user.uid,
        professorName: userData?.displayName || userData?.email || user.email,
        createdAt: Timestamp.now(),
      };
      
      const docRef = await addDoc(collection(db, 'courses'), cursoData);
      navigate(`/admin/course/${docRef.id}/add-unit`);
    } catch (error) {
      console.error('Error al crear curso:', error);
      setError('Error al crear el curso. Intenta de nuevo.');
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
            Crear Nuevo Curso
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
                Título del Curso <span className="text-red-500">*</span>
              </label>
              <input
                id="titulo"
                type="text"
                className="input-field"
                placeholder="Ej: Curso de React desde Cero"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="descripcion" className="label-field">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                id="descripcion"
                rows={4}
                className="input-field"
                placeholder="Describe de qué trata tu curso..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                maxLength={500}
              />
            </div>

            <div>
              <label htmlFor="imageUrl" className="label-field">
                URL de Imagen (Opcional)
              </label>
              <input
                id="imageUrl"
                type="url"
                className="input-field"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              {imageUrl && isValidUrl(imageUrl) && (
                <div className="mt-3">
                  <img src={imageUrl} alt="Vista previa" className="w-full h-40 object-cover rounded-lg" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <Link to="/admin" className="flex-1 btn-secondary text-center">
              Cancelar
            </Link>
            <button type="submit" disabled={loading} className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Creando...' : 'Crear Curso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
