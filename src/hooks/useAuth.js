// ============================================================
// useAuth Hook - Manejo de Autenticación
// ============================================================
// Este hook personalizado encapsula toda la lógica de autenticación
// Proporciona: usuario actual, estado de carga, funciones de login/logout
// ============================================================

import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/firebase';

// ============================================================
// Función auxiliar: Verificar si un email es de administrador
// ============================================================
const isAdminEmail = (email) => {
  const adminEmails = import.meta.env.VITE_ADMIN_EMAILS || '';
  const emails = adminEmails.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  return emails.includes(email.toLowerCase());
};

export function useAuth() {
  // Estado del usuario actual (null si no está autenticado)
  const [user, setUser] = useState(null);
  
  // Estado de carga inicial (true mientras se verifica la sesión)
  const [loading, setLoading] = useState(true);
  
  // Datos del usuario en Firestore (rol, etc.)
  const [userData, setUserData] = useState(null);

  // ============================================================
  // Efecto: Escuchar cambios en el estado de autenticación
  // ============================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Si hay usuario, obtener sus datos de Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          // Si no existe el documento, crearlo con datos básicos
          // El rol es 'admin' si el email está en la lista de administradores
          const role = isAdminEmail(user.email) ? 'admin' : 'student';
          const defaultUserData = {
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            role: role,
            createdAt: new Date(),
          };
          await setDoc(userDocRef, defaultUserData);
          setUserData(defaultUserData);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    // Cleanup: desuscribirse al desmontar
    return () => unsubscribe();
  }, []);

  // ============================================================
  // Función: Iniciar sesión con Email y Contraseña
  // ============================================================
  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return { success: false, error: getErrorMessage(error.code) };
    }
  };

  // ============================================================
  // Función: Registrar nuevo usuario con Email y Contraseña
  // ============================================================
  const registerWithEmail = async (email, password, displayName) => {
    try {
      // Crear usuario en Firebase Auth
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizar el perfil con el nombre display
      await updateProfile(result.user, { displayName });
      
        // Crear documento del usuario en Firestore
        // El rol es 'admin' si el email está en la lista de administradores
        const userDocRef = doc(db, 'users', result.user.uid);
        const role = isAdminEmail(result.user.email) ? 'admin' : 'student';
        await setDoc(userDocRef, {
          email: result.user.email,
          displayName: displayName,
          role: role,
          createdAt: new Date(),
        });
      
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Error al registrar:', error);
      return { success: false, error: getErrorMessage(error.code) };
    }
  };

  // ============================================================
  // Función: Iniciar sesión con Google
  // ============================================================
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Verificar si es la primera vez que inicia sesión con Google
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Primera vez: crear documento
        // El rol es 'admin' si el email está en la lista de administradores
        const role = isAdminEmail(result.user.email) ? 'admin' : 'student';
        await setDoc(userDocRef, {
          email: result.user.email,
          displayName: result.user.displayName,
          role: role,
          createdAt: new Date(),
        });
      }
      
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      return { success: false, error: getErrorMessage(error.code) };
    }
  };

  // ============================================================
  // Función: Cerrar sesión
  // ============================================================
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      return { success: true };
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return { success: false, error: error.message };
    }
  };

  // ============================================================
  // Función auxiliar: Obtener mensaje de error legible
  // ============================================================
  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth/user-not-found': 'No se encontró usuario con este email.',
      'auth/wrong-password': 'Contraseña incorrecta.',
      'auth/email-already-in-use': 'Este email ya está registrado.',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
      'auth/invalid-email': 'El email no es válido.',
      'auth/popup-closed-by-user': 'Se cerró la ventana de Google.',
      'auth/cancelled-popup-request': 'Se canceló la solicitud de Google.',
      'auth/popup-blocked': 'El popup fue bloqueado por el navegador.',
    };
    return errorMessages[errorCode] || 'Error al autenticar. Intenta de nuevo.';
  };

  // ============================================================
  // Valores y funciones retornados por el hook
  // ============================================================
  return {
    user,           // Usuario actual de Firebase Auth
    userData,       // Datos del usuario en Firestore (rol, etc.)
    loading,        // Estado de carga (true mientras se verifica sesión)
    loginWithEmail, // Función para login con email/password
    registerWithEmail, // Función para registro con email/password
    loginWithGoogle,    // Función para login con Google
    logout,         // Función para cerrar sesión
  };
}
