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
  const [newQuantity, setNewQuantity] = useState('1');
  const [addingItem, setAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // {listId, itemIndex}
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');

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
      // Split by comma and create item objects
      const itemNames = newItem.split(',').map(item => item.trim()).filter(Boolean);
      const items = itemNames.map(name => ({
        name,
        quantity: newQuantity || '1',
        checked: false
      }));
      await shoppingListsAPI.addItems(items);
      setNewItem('');
      setNewQuantity('1');
      fetchShoppingLists();
    } catch (err) {
      alert(err.message || 'Failed to add item');
    } finally {
      setAddingItem(false);
    }
  };

  const handleToggleCheck = async (list, itemIndex) => {
    try {
      const updatedItems = [...list.items];
      updatedItems[itemIndex].checked = !updatedItems[itemIndex].checked;

      await shoppingListsAPI.update(list.id, { items: updatedItems });
      fetchShoppingLists();
    } catch (err) {
      alert(err.message || 'Failed to update item');
    }
  };

  const handleDeleteItem = async (listId, itemIndex) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await shoppingListsAPI.deleteItem(listId, itemIndex);
      fetchShoppingLists();
    } catch (err) {
      alert(err.message || 'Failed to delete item');
    }
  };

  const handleStartEdit = (listId, itemIndex, item) => {
    setEditingItem({ listId, itemIndex });
    setEditName(item.name || '');
    setEditQuantity(item.quantity || '1');
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditName('');
    setEditQuantity('');
  };

  const handleSaveEdit = async (list) => {
    if (!editName.trim()) {
      alert('Item name cannot be empty');
      return;
    }

    try {
      const updatedItems = [...list.items];
      updatedItems[editingItem.itemIndex] = {
        ...updatedItems[editingItem.itemIndex],
        name: editName.trim(),
        quantity: editQuantity.trim() || '1'
      };

      await shoppingListsAPI.update(list.id, { items: updatedItems });
      setEditingItem(null);
      setEditName('');
      setEditQuantity('');
      fetchShoppingLists();
    } catch (err) {
      alert(err.message || 'Failed to update item');
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
          <form onSubmit={handleAddItem} className="flex flex-col gap-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Enter items (comma-separated: tomatoes, milk, eggs)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={addingItem}
              />
              <input
                type="text"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                placeholder="Quantity (e.g., 2 kg, 1 liter)"
                className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={addingItem}
              />
              <button
                type="submit"
                disabled={addingItem || !newItem.trim()}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium whitespace-nowrap"
              >
                {addingItem ? 'Adding...' : 'Add Items'}
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Tip: Items will be added to your latest active shopping list with the specified quantity
            </p>
          </form>
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
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Items ({list.items.length}):
                      </p>
                      <div className="space-y-2">
                        {list.items.map((item, index) => {
                          const isEditing = editingItem?.listId === list.id && editingItem?.itemIndex === index;
                          const itemData = typeof item === 'string' ? { name: item, quantity: '1', checked: false } : item;

                          return (
                            <div
                              key={index}
                              className={`flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border ${
                                itemData.checked ? 'border-green-300 bg-green-50' : 'border-gray-200'
                              }`}
                            >
                              {/* Checkbox */}
                              <input
                                type="checkbox"
                                checked={itemData.checked || false}
                                onChange={() => handleToggleCheck(list, index)}
                                className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500 cursor-pointer"
                                disabled={isEditing}
                              />

                              {isEditing ? (
                                // Edit Mode
                                <>
                                  <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Item name"
                                  />
                                  <input
                                    type="text"
                                    value={editQuantity}
                                    onChange={(e) => setEditQuantity(e.target.value)}
                                    className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Quantity"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleSaveEdit(list)}
                                      className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={handleCancelEdit}
                                      className="px-3 py-1.5 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm font-medium"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </>
                              ) : (
                                // Display Mode
                                <>
                                  <div className="flex-1">
                                    <span className={`text-gray-800 font-medium ${itemData.checked ? 'line-through text-gray-500' : ''}`}>
                                      {itemData.name}
                                    </span>
                                    <span className={`ml-2 text-sm ${itemData.checked ? 'text-gray-400' : 'text-gray-600'}`}>
                                      ({itemData.quantity})
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleStartEdit(list.id, index, itemData)}
                                      className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                                      disabled={list.is_completed}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteItem(list.id, index)}
                                      className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                                      disabled={list.is_completed}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
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
