import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Protected Route - sadece login olanlar girebilir
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  console.log('🔒 ProtectedRoute: Checking authentication', {
    isAuthenticated,
    loading,
    hasUser: !!user,
    userEmail: user?.email
  });

  // Sayfa yüklenirken loading göster
  if (loading) {
    console.log('⏳ ProtectedRoute: Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Login değilse → Login sayfasına yönlendir
  if (!isAuthenticated) {
    console.log('❌ ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to="/" replace />;
  }

  // Login ise → İstenen sayfayı göster
  console.log('✅ ProtectedRoute: User authenticated, rendering protected content');
  return children;
}
