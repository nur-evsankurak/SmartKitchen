import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipesAPI, authAPI } from '../services/api';

export default function Recipes() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const data = await recipesAPI.getAll();
      setRecipes(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load recipes');
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-primary-700">📖 Recipes</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your Recipe Collection
          </h2>
          <p className="text-gray-600">
            Browse and manage your favorite recipes
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="card bg-red-50 border border-red-200 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : recipes.length === 0 ? (
          /* Empty State */
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No recipes yet
            </h3>
            <p className="text-gray-600">
              Start adding recipes to build your collection!
            </p>
          </div>
        ) : (
          /* Recipe Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
              >
                {/* Recipe Image */}
                {recipe.image_url ? (
                  <img
                    src={recipe.image_url}
                    alt={recipe.name}
                    className="w-full h-48 object-cover rounded-t-lg -mt-4 -mx-4 mb-4"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-t-lg -mt-4 -mx-4 mb-4 flex items-center justify-center">
                    <span className="text-6xl">🍳</span>
                  </div>
                )}

                {/* Recipe Info */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {recipe.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {recipe.description}
                </p>

                {/* Recipe Meta */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <div className="flex items-center space-x-4">
                    {recipe.prep_time && (
                      <span className="flex items-center">
                        ⏱️ {recipe.prep_time}m
                      </span>
                    )}
                    {recipe.servings && (
                      <span className="flex items-center">
                        👥 {recipe.servings}
                      </span>
                    )}
                  </div>
                  {recipe.difficulty && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                        recipe.difficulty
                      )}`}
                    >
                      {recipe.difficulty}
                    </span>
                  )}
                </div>

                {/* Ingredients Count */}
                {recipe.ingredients && recipe.ingredients.length > 0 && (
                  <div className="text-sm text-gray-600 mb-3">
                    🥕 {recipe.ingredients.length} ingredient
                    {recipe.ingredients.length !== 1 ? 's' : ''}
                  </div>
                )}

                {/* Tags */}
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {recipe.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                    {recipe.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{recipe.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
