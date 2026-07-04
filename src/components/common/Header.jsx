// ============================================================
// Header Component - Barra de Navegación Superior
// ============================================================
// Versión responsiva con:
// - Hamburger menu para móvil
// - Dark mode support
// - Theme toggle
// - Navegación diferenciada por rol
// ============================================================

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const { user, userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPublicRoute = location.pathname.startsWith('/share/');
  const isAdmin = userData?.role === 'admin';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Cursos Online
            </Link>
          </div>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            
            {user ? (
              <>
                {/* Alumno: solo ve "Mis Cursos" */}
                {!isAdmin && (
                  <Link
                    to="/my-courses"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Mis Cursos
                  </Link>
                )}

                {/* Admin: ve "Panel Admin" */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Panel Admin
                  </Link>
                )}

                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200 dark:border-gray-600">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {userData?.displayName || user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </>
            ) : (
              <>
                {isPublicRoute ? (
                  <Link
                    to="/login"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Soy Profesor
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link to="/signup" className="btn-primary text-sm">
                      Crear Cuenta
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>

          {/* Botón Hamburger (móvil) */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Menú"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          <div className="fixed top-16 right-0 w-64 bg-white dark:bg-gray-800 shadow-lg z-50 md:hidden border-l border-gray-200 dark:border-gray-700">
            <div className="p-4 space-y-3">
              {user ? (
                <>
                  <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {userData?.displayName || user.email}
                    </p>
                    {isAdmin && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>

                  {/* Alumno */}
                  {!isAdmin && (
                    <Link
                      to="/my-courses"
                      onClick={handleNavClick}
                      className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Mis Cursos
                    </Link>
                  )}

                  {/* Admin */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={handleNavClick}
                      className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Panel Admin
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-md text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  {isPublicRoute ? (
                    <Link
                      to="/login"
                      onClick={handleNavClick}
                      className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Soy Profesor
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={handleNavClick}
                        className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Iniciar Sesión
                      </Link>
                      <Link
                        to="/signup"
                        onClick={handleNavClick}
                        className="block px-3 py-2 rounded-md bg-blue-600 text-white text-center rounded-lg"
                      >
                        Crear Cuenta
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
