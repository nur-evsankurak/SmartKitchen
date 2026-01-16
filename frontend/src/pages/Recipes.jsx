import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { recipesAPI, authAPI, ingredientsAPI, shoppingListsAPI } from '../services/api';

export default function Recipes() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'ai'

  // Regular recipes state
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
    ingredients: '', // Comma-separated ingredients
  });

  // AI Recommendations state
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [preferences, setPreferences] = useState('');
  const [servings, setServings] = useState(2);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    fetchRecipes();
    fetchIngredients();
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

  const fetchIngredients = async () => {
    try {
      const data = await ingredientsAPI.getAll();
      setIngredients(data);
    } catch (err) {
      console.error('Error fetching ingredients:', err);
    }
  };

  const handleGetAIRecommendations = async () => {
    if (selectedIngredients.length === 0) {
      setAiError('Please select at least one ingredient');
      return;
    }

    try {
      setAiLoading(true);
      setAiError('');
      const data = await recipesAPI.getAIRecommendations(
        selectedIngredients,
        preferences,
        servings
      );
      setAiRecommendations(data.ai_recommendations || []);
      console.log('🤖 AI Recommendations:', data);
    } catch (err) {
      setAiError(err.message || 'Failed to get AI recommendations');
      console.error('Error getting AI recommendations:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const toggleIngredient = (ingredientName) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredientName)
        ? prev.filter((i) => i !== ingredientName)
        : [...prev, ingredientName]
    );
  };

  const handleAddToShoppingList = async (missingIngredients, recipeName) => {
    if (!missingIngredients || missingIngredients.length === 0) {
      alert('No missing ingredients to add!');
      return;
    }

    try {
      await shoppingListsAPI.addItems(missingIngredients);
      alert(`✅ Added ${missingIngredients.length} ingredients to shopping list for "${recipeName}"!`);
    } catch (err) {
      console.error('Error adding to shopping list:', err);
      alert('Failed to add to shopping list');
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      logout();
      navigate('/');
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
      ingredients: '',
    });
    setShowModal(true);
  };

  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe);

    // Convert ingredients array to comma-separated string
    let ingredientsStr = '';
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      ingredientsStr = recipe.ingredients
        .map(ing => typeof ing === 'string' ? ing : (ing.name || ''))
        .filter(Boolean)
        .join(', ');
    }

    setFormData({
      name: recipe.name || '',
      description: recipe.description || '',
      prep_time: recipe.prep_time || '',
      cook_time: recipe.cook_time || '',
      servings: recipe.servings || '',
      difficulty: recipe.difficulty || 'medium',
      image_url: recipe.image_url || '',
      ingredients: ingredientsStr,
    });
    setShowModal(true);
  };

  const handleDeleteRecipe = async (recipeId, recipeName) => {
    if (!confirm(`Are you sure you want to delete "${recipeName}"?`)) {
      return;
    }

    try {
      await recipesAPI.delete(recipeId);
      fetchRecipes();
    } catch (err) {
      alert(err.message || 'Failed to delete recipe');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Convert comma-separated ingredients to array
      const ingredientsArray = formData.ingredients
        ? formData.ingredients.split(',').map(ing => ing.trim()).filter(Boolean)
        : [];

      const data = {
        ...formData,
        prep_time: formData.prep_time ? parseInt(formData.prep_time) : null,
        cook_time: formData.cook_time ? parseInt(formData.cook_time) : null,
        servings: formData.servings ? parseInt(formData.servings) : null,
        ingredients: ingredientsArray,
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
        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📚 All Recipes
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ai'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🤖 AI Recommendations
            </button>
          </nav>
        </div>

        {/* All Recipes Tab */}
        {activeTab === 'all' && (
          <>
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

            {error && (
              <div className="card bg-red-50 border border-red-200 mb-6">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : recipes.length === 0 ? (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="card hover:shadow-lg transition-shadow relative"
                  >
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

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {recipe.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {recipe.description}
                    </p>

                    {/* Ingredients */}
                    {recipe.ingredients && recipe.ingredients.length > 0 && (
                      <div className="mb-3 pb-3 border-b border-gray-200">
                        <p className="text-xs font-medium text-gray-700 mb-1">Ingredients:</p>
                        <div className="flex flex-wrap gap-1">
                          {recipe.ingredients.slice(0, 5).map((ing, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                            >
                              {typeof ing === 'string' ? ing : ing.name}
                            </span>
                          ))}
                          {recipe.ingredients.length > 5 && (
                            <span className="text-xs text-gray-500">
                              +{recipe.ingredients.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

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
          </>
        )}

        {/* AI Recommendations Tab */}
        {activeTab === 'ai' && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🤖 AI-Powered Recipe Recommendations
              </h2>
              <p className="text-gray-600">
                Select your available ingredients and get personalized recipe suggestions
              </p>
            </div>

            {/* Ingredient Selection */}
            <div className="card mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Available Ingredients
              </h3>

              {ingredients.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No ingredients found. Add ingredients in the Ingredients page first.
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                  {ingredients.map((ing) => (
                    <button
                      key={ing.id}
                      onClick={() => toggleIngredient(ing.name)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedIngredients.includes(ing.name)
                          ? 'bg-primary-100 border-primary-600 text-primary-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-primary-300'
                      }`}
                    >
                      {selectedIngredients.includes(ing.name) ? '✓ ' : ''}
                      {ing.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Preferences */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferences (optional)
                </label>
                <input
                  type="text"
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  placeholder="e.g., vegetarian, quick meals, low calorie"
                  className="input-field"
                />
              </div>

              {/* Servings */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servings
                </label>
                <input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(parseInt(e.target.value) || 2)}
                  min="1"
                  max="12"
                  className="input-field max-w-xs"
                />
              </div>

              {/* Get Recommendations Button */}
              <button
                onClick={handleGetAIRecommendations}
                disabled={aiLoading || selectedIngredients.length === 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Getting AI Recommendations...
                  </>
                ) : (
                  '🤖 Get AI Recommendations'
                )}
              </button>

              {selectedIngredients.length > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                  Selected: {selectedIngredients.join(', ')}
                </div>
              )}
            </div>

            {/* AI Error */}
            {aiError && (
              <div className="card bg-red-50 border border-red-200 mb-6">
                <p className="text-sm text-red-600">{aiError}</p>
              </div>
            )}

            {/* AI Recommendations Results */}
            {aiRecommendations.length > 0 && (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Recommended Recipes for You
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {aiRecommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="card hover:shadow-lg transition-shadow relative border-2 border-primary-200"
                    >
                      {/* Match Score Badge */}
                      <div className="absolute top-2 right-2 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                        {rec.match_score}% Match
                      </div>

                      {/* Recipe Image */}
                      <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-t-lg -mt-4 -mx-4 mb-4 flex items-center justify-center">
                        <span className="text-6xl">
                          {rec.full_recipe?.tags?.includes('vegetarian') ? '🥗' : '🍳'}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {rec.recipe_name}
                      </h3>

                      {/* AI Reasoning */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <p className="text-xs font-medium text-blue-900 mb-1">
                          🤖 AI Analysis:
                        </p>
                        <p className="text-sm text-blue-800">{rec.reasoning}</p>
                      </div>

                      {/* Missing Ingredients */}
                      {rec.missing_ingredients && rec.missing_ingredients.length > 0 ? (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">
                            Missing ingredients:
                          </p>
                          <p className="text-sm text-red-600 mb-2">
                            {rec.missing_ingredients.join(', ')}
                          </p>
                          {/* Add to Shopping List Button */}
                          <button
                            onClick={() => handleAddToShoppingList(rec.missing_ingredients, rec.recipe_name)}
                            className="text-xs bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-md transition-colors flex items-center gap-1"
                          >
                            🛒 Add to Shopping List
                          </button>
                        </div>
                      ) : (
                        <div className="mb-3">
                          <p className="text-sm text-green-600 font-medium">
                            ✓ You have all ingredients!
                          </p>
                        </div>
                      )}

                      {/* Suggested Substitutions */}
                      {rec.suggested_substitutions &&
                        Object.keys(rec.suggested_substitutions).length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-700 mb-1">
                              💡 Substitutions:
                            </p>
                            <div className="text-sm text-gray-600">
                              {Object.entries(rec.suggested_substitutions).map(
                                ([missing, substitute]) => (
                                  <div key={missing}>
                                    {missing} → {substitute}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Recipe Meta */}
                      {rec.full_recipe && (
                        <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-3 border-t">
                          <div className="flex items-center space-x-4">
                            {rec.full_recipe.prep_time && (
                              <span>⏱️ {rec.full_recipe.prep_time}m</span>
                            )}
                            {rec.full_recipe.servings && (
                              <span>👥 {rec.full_recipe.servings}</span>
                            )}
                          </div>
                          {rec.full_recipe.difficulty && (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                                rec.full_recipe.difficulty
                              )}`}
                            >
                              {rec.full_recipe.difficulty}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {!aiLoading && aiRecommendations.length === 0 && !aiError && (
              <div className="card text-center py-12">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ready for AI Recommendations
                </h3>
                <p className="text-gray-600">
                  Select your ingredients above and click "Get AI Recommendations"
                </p>
              </div>
            )}
          </>
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
                    Ingredients
                  </label>
                  <textarea
                    value={formData.ingredients}
                    onChange={(e) =>
                      setFormData({ ...formData, ingredients: e.target.value })
                    }
                    className="input-field"
                    rows="3"
                    placeholder="Enter ingredients separated by commas (e.g., tomato, egg, onion, butter)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate ingredients with commas
                  </p>
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
