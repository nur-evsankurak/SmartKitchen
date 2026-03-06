import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';
import Ingredients from './pages/Ingredients';
import Recipes from './pages/Recipes';
import ShoppingList from './pages/ShoppingList';
import IngredientAnalytics from './pages/IngredientAnalytics';
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
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Login />} />
            <Route path="/auth/verify" element={<Verify />} />

            {/* Protected routes */}
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
            <Route
              path="/shopping-list"
              element={
                <ProtectedRoute>
                  <ShoppingList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ingredient-analytics"
              element={
                <ProtectedRoute>
                  <IngredientAnalytics />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;