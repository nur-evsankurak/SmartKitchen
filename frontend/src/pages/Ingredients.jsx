import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ingredientsAPI } from '../services/api';
import Modal from '../components/Modal';

export default function Ingredients() {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    calories_per_unit: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const data = await ingredientsAPI.getAll();
      setIngredients(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch ingredients');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const ingredientData = {
        name: formData.name,
        category: formData.category || null,
        unit: formData.unit || null,
        calories_per_unit: formData.calories_per_unit
          ? parseFloat(formData.calories_per_unit)
          : null,
        additional_data: {},
      };

      await ingredientsAPI.create(ingredientData);

      // Reset form and close modal
      setFormData({
        name: '',
        category: '',
        unit: '',
        calories_per_unit: '',
      });
      setIsModalOpen(false);

      // Refresh ingredients list
      fetchIngredients();
    } catch (err) {
      setError(err.message || 'Failed to add ingredient');
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await ingredientsAPI.delete(id);
      fetchIngredients();
    } catch (err) {
      setError(err.message || 'Failed to delete ingredient');
      console.error('Delete error:', err);
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
              className="text-gray-600 hover:text-gray-900"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Ingredients</h1>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Ingredient
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg
              className="animate-spin h-10 w-10 text-primary-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : ingredients.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🥕</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No ingredients yet
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by adding your first ingredient
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              Add Your First Ingredient
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ingredients.map((ingredient) => (
              <div key={ingredient.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {ingredient.name}
                  </h3>
                  <button
                    onClick={() => handleDelete(ingredient.id, ingredient.name)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                {ingredient.category && (
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded mb-2">
                    {ingredient.category}
                  </span>
                )}

                <div className="space-y-1 text-sm text-gray-600">
                  {ingredient.unit && (
                    <p>
                      <span className="font-medium">Unit:</span> {ingredient.unit}
                    </p>
                  )}
                  {ingredient.calories_per_unit && (
                    <p>
                      <span className="font-medium">Calories:</span>{' '}
                      {ingredient.calories_per_unit} per {ingredient.unit || 'unit'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Ingredient Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Ingredient"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input-field"
              placeholder="e.g., Tomato"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="input-field"
              placeholder="e.g., Vegetable"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) =>
                setFormData({ ...formData, unit: e.target.value })
              }
              className="input-field"
              placeholder="e.g., kg, pieces, cups"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calories per Unit
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.calories_per_unit}
              onChange={(e) =>
                setFormData({ ...formData, calories_per_unit: e.target.value })
              }
              className="input-field"
              placeholder="e.g., 18.0"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Adding...' : 'Add Ingredient'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
