import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Protected Route - sadece login olanlar girebilir
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Sayfa yüklenirken loading göster
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Login değilse → Login sayfasına yönlendir
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Login ise → İstenen sayfayı göster
  return children;
}
