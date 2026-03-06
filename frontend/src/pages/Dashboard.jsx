import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authAPI.logout();
      logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      logout();
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Your Kitchen Dashboard
          </h2>
          <p className="text-gray-600">
            Manage your recipes, meal plans, and smart appliances all in one place.
          </p>
        </div>

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
}