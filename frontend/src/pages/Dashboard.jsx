import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth(); // AuthContext'ten logout fonksiyonu
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authAPI.logout(); // Backend'e logout isteği
      logout(); // AuthContext'i temizle (localStorage'ı da temizler)
      navigate('/'); // Login sayfasına yönlendir
    } catch (err) {
      console.error('Logout error:', err);
      // Hata olsa bile logout yap
      logout();
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-700">
              🍳 SmartKitchen
            </h1>
          </div>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Your Kitchen Dashboard
          </h2>
          <p className="text-gray-600">
            Manage your recipes, meal plans, and smart appliances all in one place.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="Recipes"
            description="Browse and manage your recipe collection"
            icon="📖"
            color="bg-blue-100 text-blue-600"
            onClick={() => navigate('/recipes')}
          />
          <DashboardCard
            title="Meal Plans"
            description="Plan your meals for the week"
            icon="📅"
            color="bg-green-100 text-green-600"
            comingSoon
          />
          <DashboardCard
            title="Shopping Lists"
            description="Keep track of ingredients you need"
            icon="🛒"
            color="bg-purple-100 text-purple-600"
            onClick={() => navigate('/shopping-list')}
          />
          <DashboardCard
            title="Smart Appliances"
            description="Monitor and control your kitchen devices"
            icon="⚙️"
            color="bg-orange-100 text-orange-600"
            comingSoon
          />
          <DashboardCard
            title="Ingredients"
            description="Manage your pantry inventory"
            icon="🥕"
            color="bg-yellow-100 text-yellow-600"
            onClick={() => navigate('/ingredients')}
          />
          <DashboardCard
            title="Activity Log"
            description="View your recent kitchen activities"
            icon="📊"
            color="bg-pink-100 text-pink-600"
            comingSoon
          />
        </div>

        {/* Success Message */}
        <div className="mt-8 card bg-green-50 border border-green-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Authentication Successful!
              </h3>
              <p className="mt-1 text-sm text-green-700">
                You're now logged in to SmartKitchen. The magic link authentication system is working perfectly!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardCard({ title, description, icon, color, onClick, comingSoon }) {
  const handleClick = () => {
    if (comingSoon) {
      alert(`${title} feature is coming soon! Stay tuned.`);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`card hover:shadow-lg transition-shadow ${onClick || comingSoon ? 'cursor-pointer' : ''} ${comingSoon ? 'opacity-75' : ''}`}
    >
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-2xl mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {title}
        {comingSoon && <span className="ml-2 text-xs text-gray-500">(Coming Soon)</span>}
      </h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );


const IngredientDashboard = () => {
    const [ingredientName, setIngredientName] = useState('');
    const [recipeCount, setRecipeCount] = useState(0);

    // Function to check the backend
    const checkRecipes = async (value) => {
        setIngredientName(value);

        if (value.length > 1) {
            try {
                const response = await fetch(`http://localhost:5000/api/ingredient-stats?name=${value}`);
                const data = await response.json();
                setRecipeCount(data.count);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        } else {
            setRecipeCount(0);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h2>SmartKitchen Dashboard</h2>

            <div style={{ marginBottom: '10px' }}>
                <label>Add Ingredient: </label>
                <input
                    type="text"
                    placeholder="e.g. butter, tomato..."
                    value={ingredientName}
                    onChange={(e) => checkRecipes(e.target.value)}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            </div>

            {ingredientName.length > 1 && (
                <div style={{ color: recipeCount > 0 ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>
                    {recipeCount > 0
                        ? `✨ ${recipeCount} recipes have ${ingredientName}`
                        : `No recipes found with ${ingredientName}`}
                </div>
            )}
        </div>
    );
};

export default IngredientDashboard;
}
