import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authAPI.logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
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
          />
          <DashboardCard
            title="Meal Plans"
            description="Plan your meals for the week"
            icon="📅"
            color="bg-green-100 text-green-600"
          />
          <DashboardCard
            title="Shopping Lists"
            description="Keep track of ingredients you need"
            icon="🛒"
            color="bg-purple-100 text-purple-600"
          />
          <DashboardCard
            title="Smart Appliances"
            description="Monitor and control your kitchen devices"
            icon="⚙️"
            color="bg-orange-100 text-orange-600"
          />
          <DashboardCard
            title="Ingredients"
            description="Manage your pantry inventory"
            icon="🥕"
            color="bg-yellow-100 text-yellow-600"
          />
          <DashboardCard
            title="Activity Log"
            description="View your recent kitchen activities"
            icon="📊"
            color="bg-pink-100 text-pink-600"
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

function DashboardCard({ title, description, icon, color }) {
  return (
    <div className="card hover:shadow-lg transition-shadow cursor-pointer">
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-2xl mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
