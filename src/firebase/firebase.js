// ============================================================
// Firebase Configuration - Configuración Modular v9+
// ============================================================
// Este archivo contiene la configuración de Firebase para la aplicación
// Usa la sintaxis modular de Firebase v9/v10 (tree-shaking friendly)
// ============================================================

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ============================================================
// Configuración de Firebase
// Estos valores se leen de las variables de entorno (.env)
// ============================================================
const firebaseConfig = {
  // API Key de Firebase (necesaria para autenticación y Firestore)
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  
  // Dominio de autenticación de Firebase
  // Formato: tu-proyecto.firebaseapp.com
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  
  // ID único del proyecto en Firebase
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  
  // Bucket de almacenamiento para archivos (imágenes, videos, etc.)
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  
  // ID del remitente de mensajería (para notificaciones push)
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  
  // ID de la aplicación registrada en Firebase
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ============================================================
// Inicializar Firebase
// ============================================================
const app = initializeApp(firebaseConfig);

// ============================================================
// Servicios de Firebase exportados
// ============================================================

// Servicio de Autenticación
// Maneja registro, inicio de sesión, cierre de sesión, etc.
export const auth = getAuth(app);

// Proveedor de autenticación con Google
// Se usa para el botón "Iniciar sesión con Google"
export const googleProvider = new GoogleAuthProvider();
// Configuración del proveedor Google (opcional)
googleProvider.setCustomParameters({
  prompt: 'select_account', // Siempre mostrar selector de cuenta
});

// Servicio de Cloud Firestore
// Base de datos NoSQL para almacenar cursos, unidades y progreso
export const db = getFirestore(app);

// ============================================================
// Notas importantes:
// 1. Asegúrate de tener las reglas de Firestore configuradas
// 2. Para desarrollo, puedes usar las reglas de prueba:
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /{document=**} {
//          allow read, write: if true;
//        }
//      }
//    }
// 3. En producción, configura reglas más restrictivas
// ============================================================
