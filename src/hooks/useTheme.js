// ============================================================
// useTheme Hook - Estado Compartido del Tema
// ============================================================
// Hook singleton que maneja el estado del tema (claro/oscuro)
// Todas las instancias de ThemeToggle comparten el mismo estado
// ============================================================

import { useState, useEffect, useCallback } from 'react';

// Estado global compartido (singleton)
let globalState = {
  isDark: false,
  listeners: new Set(),
  initialized: false,
};

// Función para leer el tema inicial de localStorage
// IMPORTANTE: localStorage PRIMERO, sistema SOLO si no hay preferencia
const getInitialTheme = () => {
  if (typeof window === 'undefined') return false;
  
  const savedTheme = localStorage.getItem('theme');
  
  // Si hay preferencia guardada, usarla
  if (savedTheme === 'dark') return true;
  if (savedTheme === 'light') return false;
  
  // Si NO hay preferencia, usar preferencia del sistema
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// Inicializar el estado global SOLO UNA VEZ
if (!globalState.initialized) {
  globalState.isDark = getInitialTheme();
  globalState.initialized = true;
}

export function useTheme() {
  const [isDark, setIsDark] = useState(globalState.isDark);

  // ============================================================
  // Función: Aplicar tema al DOM
  // ============================================================
  const applyTheme = useCallback((dark) => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // ============================================================
  // Efecto: Aplicar tema inicial al montar
  // ============================================================
  useEffect(() => {
    // Leer directamente de localStorage para evitar carreras
    const savedTheme = localStorage.getItem('theme');
    let shouldBeDark;
    
    if (savedTheme === 'dark') {
      shouldBeDark = true;
    } else if (savedTheme === 'light') {
      shouldBeDark = false;
    } else {
      // No hay preferencia: usar sistema
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    // Aplicar al DOM
    applyTheme(shouldBeDark);
    
    // Actualizar estado global si es necesario
    if (globalState.isDark !== shouldBeDark) {
      globalState.isDark = shouldBeDark;
      setIsDark(shouldBeDark);
    }
  }, [applyTheme]);

  // ============================================================
  // Sincronizar con el estado global
  // ============================================================
  useEffect(() => {
    const listener = (newIsDark) => {
      setIsDark(newIsDark);
    };
    
    globalState.listeners.add(listener);
    
    return () => {
      globalState.listeners.delete(listener);
    };
  }, []);

  // ============================================================
  // Función: Alternar tema
  // ============================================================
  const toggleTheme = useCallback(() => {
    const newIsDark = !globalState.isDark;
    
    // Actualizar estado global
    globalState.isDark = newIsDark;
    
    // Guardar en localStorage
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    
    // Aplicar al DOM
    applyTheme(newIsDark);
    
    // Notificar a todos los listeners
    globalState.listeners.forEach(listener => listener(newIsDark));
  }, [applyTheme]);

  // ============================================================
  // Escuchar cambios en la preferencia del sistema
  // ============================================================
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // SOLO aplicar si NO hay preferencia guardada
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        const newIsDark = e.matches;
        globalState.isDark = newIsDark;
        applyTheme(newIsDark);
        globalState.listeners.forEach(listener => listener(newIsDark));
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [applyTheme]);

  return { isDark, toggleTheme };
}
