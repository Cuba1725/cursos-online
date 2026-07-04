// ============================================================
// useProgress Hook - Manejo de Progreso y Content Dripping
// ============================================================
// Este hook maneja el progreso del usuario en los cursos
// Implementa la lógica de "goteo de contenido" (Content Dripping)
// 
// NUEVO: Guarda información del curso cuando el alumno accede
// para que aparezca en "Mis Cursos"
// ============================================================

import { useState, useEffect } from 'react';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  collection, 
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

export function useProgress(userId, courseId) {
  // ============================================================
  // Estados del hook
  // ============================================================
  const [unidadesCompletadas, setUnidadesCompletadas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [unidadActual, setUnidadActual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marcandoUnidad, setMarcandoUnidad] = useState(false);
  const [cursoInfo, setCursoInfo] = useState(null);

  // ============================================================
  // Efecto 1: Cargar unidades del curso desde Firestore
  // ============================================================
  useEffect(() => {
    const cargarUnidades = async () => {
      if (!courseId) return;
      
      try {
        const unitsRef = collection(db, 'courses', courseId, 'units');
        const q = query(unitsRef, orderBy('orden', 'asc'));
        const querySnapshot = await getDocs(q);
        
        const unidadesCargadas = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setUnidades(unidadesCargadas);
        
        if (unidadesCargadas.length > 0 && !unidadActual) {
          setUnidadActual(unidadesCargadas[0].id);
        }
      } catch (error) {
        console.error('Error al cargar unidades:', error);
      }
    };
    
    cargarUnidades();
  }, [courseId]);

  // ============================================================
  // Efecto 2: Cargar información del curso
  // ============================================================
  useEffect(() => {
    const cargarCursoInfo = async () => {
      if (!courseId) return;
      
      try {
        const cursoRef = doc(db, 'courses', courseId);
        const cursoDoc = await getDoc(cursoRef);
        
        if (cursoDoc.exists()) {
          setCursoInfo({
            id: cursoDoc.id,
            title: cursoDoc.data().title,
            imageUrl: cursoDoc.data().imageUrl,
            professorName: cursoDoc.data().professorName,
          });
        }
      } catch (error) {
        console.error('Error al cargar info del curso:', error);
      }
    };
    
    cargarCursoInfo();
  }, [courseId]);

  // ============================================================
  // Efecto 3: Cargar progreso del usuario desde Firestore
  // ============================================================
  useEffect(() => {
    const cargarProgreso = async () => {
      if (!userId || !courseId) {
        setLoading(false);
        return;
      }
      
      try {
        const progressRef = doc(db, 'userProgress', userId, 'courses', courseId);
        const progressDoc = await getDoc(progressRef);
        
        if (progressDoc.exists()) {
          setUnidadesCompletadas(progressDoc.data().unidadesCompletadas || []);
        } else {
          setUnidadesCompletadas([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar progreso:', error);
        setLoading(false);
      }
    };
    
    cargarProgreso();
  }, [userId, courseId]);

  // ============================================================
  // Función: Guardar referencia del curso en "Mis Cursos"
  // Se llama cuando el alumno accede por primera vez al curso
  // ============================================================
  const guardarCursoEnMisCursos = async (cursoData) => {
    if (!userId || !courseId) return;
    
    try {
      const progressRef = doc(db, 'userProgress', userId, 'courses', courseId);
      const progressDoc = await getDoc(progressRef);
      
      if (!progressDoc.exists()) {
        // Primera vez que accede: crear documento con info del curso
        await setDoc(progressRef, {
          unidadesCompletadas: [],
          ultimoAcceso: new Date(),
          accessedAt: new Date(),
          courseTitle: cursoData.title || '',
          courseImageUrl: cursoData.imageUrl || null,
          professorName: cursoData.professorName || null,
        });
      } else {
        // Ya existía: solo actualizar último acceso
        await updateDoc(progressRef, {
          ultimoAcceso: new Date(),
        });
      }
    } catch (error) {
      console.error('Error al guardar curso en Mis Cursos:', error);
    }
  };

  // ============================================================
  // Función: Verificar si una unidad está desbloqueada
  // ============================================================
  const estaDesbloqueada = (unitId) => {
    if (unidades.length === 0) return false;
    
    const unidad = unidades.find(u => u.id === unitId);
    if (!unidad) return false;
    
    if (unidadesCompletadas.includes(unitId)) return true;
    
    const unidadesCompletadasOrdenadas = unidades
      .filter(u => unidadesCompletadas.includes(u.id))
      .sort((a, b) => b.orden - a.orden);
    
    if (unidadesCompletadasOrdenadas.length === 0) {
      return unidad.orden === 1;
    }
    
    const ultimaOrdenCompletada = unidadesCompletadasOrdenadas[0].orden;
    return unidad.orden === ultimaOrdenCompletada + 1;
  };

  // ============================================================
  // Función: Marcar una unidad como completada
  // ============================================================
  const marcarUnidad = async (unitId) => {
    if (!userId || !courseId || !unitId) return;
    if (marcandoUnidad) return;
    
    setMarcandoUnidad(true);
    
    try {
      const progressRef = doc(db, 'userProgress', userId, 'courses', courseId);
      const progressDoc = await getDoc(progressRef);
      
      if (progressDoc.exists()) {
        await updateDoc(progressRef, {
          unidadesCompletadas: arrayUnion(unitId),
          ultimoAcceso: new Date(),
        });
      } else {
        // Crear documento con info del curso si no existe
        await setDoc(progressRef, {
          unidadesCompletadas: [unitId],
          ultimoAcceso: new Date(),
          accessedAt: new Date(),
          courseTitle: cursoInfo?.title || '',
          courseImageUrl: cursoInfo?.imageUrl || null,
          professorName: cursoInfo?.professorName || null,
        });
      }
      
      setUnidadesCompletadas(prev => [...prev, unitId]);
      
      const unidadActual = unidades.find(u => u.id === unitId);
      if (unidadActual) {
        const siguienteUnidad = unidades.find(u => u.orden === unidadActual.orden + 1);
        if (siguienteUnidad) {
          setUnidadActual(siguienteUnidad.id);
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error al marcar unidad:', error);
      return { success: false, error: error.message };
    } finally {
      setMarcandoUnidad(false);
    }
  };

  const obtenerProgreso = () => {
    if (unidades.length === 0) return 0;
    return Math.round((unidadesCompletadas.length / unidades.length) * 100);
  };

  const cursoCompletado = () => {
    return unidades.length > 0 && unidadesCompletadas.length === unidades.length;
  };

  return {
    unidades,
    unidadesCompletadas,
    unidadActual,
    setUnidadActual,
    loading,
    marcandoUnidad,
    cursoInfo,
    estaDesbloqueada,
    marcarUnidad,
    guardarCursoEnMisCursos,
    obtenerProgreso,
    cursoCompletado,
  };
}
