import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipesAPI, authAPI } from '../services/api';

export default function Recipes() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prep_time: '',
    cook_time: '',
    servings: '',
    difficulty: 'medium',
    image_url: '',
  });

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

  const handleAddRecipe = () => {
    setEditingRecipe(null);
    setFormData({
      name: '',
      description: '',
      prep_time: '',
      cook_time: '',
      servings: '',
      difficulty: 'medium',
      image_url: '',
    });
    setShowModal(true);
  };

  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      name: recipe.name || '',
      description: recipe.description || '',
      prep_time: recipe.prep_time || '',
      cook_time: recipe.cook_time || '',
      servings: recipe.servings || '',
      difficulty: recipe.difficulty || 'medium',
      image_url: recipe.image_url || '',
    });
    setShowModal(true);
  };

  const handleDeleteRecipe = async (recipeId, recipeName) => {
    if (!confirm(`Are you sure you want to delete "${recipeName}"?`)) {
      return;
    }

    try {
      await recipesAPI.delete(recipeId);
      fetchRecipes(); // Reload recipes
    } catch (err) {
      alert(err.message || 'Failed to delete recipe');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        prep_time: formData.prep_time ? parseInt(formData.prep_time) : null,
        cook_time: formData.cook_time ? parseInt(formData.cook_time) : null,
        servings: formData.servings ? parseInt(formData.servings) : null,
      };

      if (editingRecipe) {
        await recipesAPI.update(editingRecipe.id, data);
      } else {
        await recipesAPI.create(data);
      }

      setShowModal(false);
      fetchRecipes();
    } catch (err) {
      alert(err.message || 'Failed to save recipe');
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
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your Recipe Collection
            </h2>
            <p className="text-gray-600">
              Browse and manage your favorite recipes
            </p>
          </div>
          <button
            onClick={handleAddRecipe}
            className="btn-primary flex items-center"
          >
            <span className="text-xl mr-2">+</span>
            Add Recipe
          </button>
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
            <p className="text-gray-600 mb-4">
              Start adding recipes to build your collection!
            </p>
            <button onClick={handleAddRecipe} className="btn-primary">
              Add Your First Recipe
            </button>
          </div>
        ) : (
          /* Recipe Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="card hover:shadow-lg transition-shadow relative"
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

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => handleEditRecipe(recipe)}
                    className="bg-white hover:bg-gray-50 text-gray-700 rounded-full p-2 shadow-md"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteRecipe(recipe.id, recipe.name)}
                    className="bg-white hover:bg-red-50 text-red-600 rounded-full p-2 shadow-md"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>

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
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal for Add/Edit Recipe */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipe Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input-field"
                    placeholder="e.g., Chocolate Chip Cookies"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="input-field"
                    rows="3"
                    placeholder="Brief description of the recipe..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prep Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.prep_time}
                      onChange={(e) =>
                        setFormData({ ...formData, prep_time: e.target.value })
                      }
                      className="input-field"
                      placeholder="15"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cook Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.cook_time}
                      onChange={(e) =>
                        setFormData({ ...formData, cook_time: e.target.value })
                      }
                      className="input-field"
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Servings
                    </label>
                    <input
                      type="number"
                      value={formData.servings}
                      onChange={(e) =>
                        setFormData({ ...formData, servings: e.target.value })
                      }
                      className="input-field"
                      placeholder="4"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) =>
                        setFormData({ ...formData, difficulty: e.target.value })
                      }
                      className="input-field"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    className="input-field"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingRecipe ? 'Update Recipe' : 'Add Recipe'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
