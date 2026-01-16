import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { shoppingListsAPI, authAPI } from '../services/api';

export default function ShoppingList() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [shoppingLists, setShoppingLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newItem, setNewItem] = useState('');
  const [addingItem, setAddingItem] = useState(false);

  useEffect(() => {
    fetchShoppingLists();
  }, []);

  const fetchShoppingLists = async () => {
    try {
      setLoading(true);
      const data = await shoppingListsAPI.getAll();
      setShoppingLists(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load shopping lists');
      console.error('Error fetching shopping lists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    if (!newItem.trim()) {
      return;
    }

    try {
      setAddingItem(true);
      const items = newItem.split(',').map(item => item.trim()).filter(Boolean);
      await shoppingListsAPI.addItems(items);
      setNewItem('');
      fetchShoppingLists();
    } catch (err) {
      alert(err.message || 'Failed to add item');
    } finally {
      setAddingItem(false);
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
            <h1 className="text-2xl font-bold text-primary-700">🛒 Shopping Lists</h1>
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
        {/* Add Item Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Items</h2>
          <form onSubmit={handleAddItem} className="flex gap-3">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Enter items (comma-separated: tomatoes, milk, eggs)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={addingItem}
            />
            <button
              type="submit"
              disabled={addingItem || !newItem.trim()}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {addingItem ? 'Adding...' : 'Add Items'}
            </button>
          </form>
          <p className="text-sm text-gray-500 mt-2">
            Tip: Items will be added to your latest active shopping list
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading shopping lists...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Shopping Lists */}
        {!loading && !error && (
          <div className="space-y-6">
            {shoppingLists.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500 text-lg">No shopping lists yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Add items above to create your first shopping list
                </p>
              </div>
            ) : (
              shoppingLists.map((list) => (
                <div
                  key={list.id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {list.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Created: {new Date(list.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        list.is_completed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {list.is_completed ? '✓ Completed' : 'Active'}
                    </span>
                  </div>

                  {/* Items List */}
                  {list.items && list.items.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Items ({list.items.length}):
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {list.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg"
                          >
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm italic">No items in this list</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
