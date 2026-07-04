// ============================================================
// App Component - Componente Principal
// ============================================================

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import CourseViewer from './components/courses/CourseViewer';
import MyCourses from './components/courses/MyCourses';
import AdminDashboard from './components/admin/AdminDashboard';
import CreateCourse from './components/admin/CreateCourse';
import CreateUnit from './components/admin/CreateUnit';
import Header from './components/common/Header';
import ProtectedRoute from './components/common/ProtectedRoute';

import './styles/index.css';

function HomePage() {
  const { user, userData, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
      </div>
    );
  }
  
  // Redirigir según el rol del usuario
  if (user) {
    if (userData?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/my-courses" replace />;
  }
  
  return <Navigate to="/login" replace />;
}

function App() {
  const { loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <main>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Link compartido: alumnos acceden por aquí */}
            <Route path="/share/:courseId" element={<CourseViewer publicMode={true} />} />
            
            {/* Mis Cursos: solo alumnos ven sus cursos */}
            <Route
              path="/my-courses"
              element={
                <ProtectedRoute>
                  <MyCourses />
                </ProtectedRoute>
              }
            />
            
            {/* Ruta legacy: redirigir a /my-courses */}
            <Route path="/courses" element={<Navigate to="/my-courses" replace />} />
            <Route path="/courses/:courseId" element={<Navigate to="/share/:courseId" replace />} />
            
            {/* Rutas admin: solo profesores */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/create-course" element={<ProtectedRoute adminOnly><CreateCourse /></ProtectedRoute>} />
            <Route path="/admin/course/:courseId/add-unit" element={<ProtectedRoute adminOnly><CreateUnit /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
