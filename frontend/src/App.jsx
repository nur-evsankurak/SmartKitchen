import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';
import Ingredients from './pages/Ingredients';
import Recipes from './pages/Recipes';
import { useEffect } from 'react';

function LocationLogger() {
  const location = useLocation();

  useEffect(() => {
    console.log('📍 Route changed:', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      state: location.state,
      fullURL: window.location.href
    });
  }, [location]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <Router basename="/smartkitchen-frontend">
        <LocationLogger />
        <Routes>
          {/* Public routes - herkes erişebilir */}
          <Route path="/" element={<Login />} />
          <Route path="/auth/verify" element={<Verify />} />

          {/* Protected routes - sadece login olanlar */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ingredients"
            element={
              <ProtectedRoute>
                <Ingredients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipes"
            element={
              <ProtectedRoute>
                <Recipes />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
