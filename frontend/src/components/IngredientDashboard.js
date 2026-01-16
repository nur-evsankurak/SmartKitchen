import React, { useState } from 'react';

const IngredientDashboard = () => {
  const [text, setText] = useState('');
  const [recipeCount, setRecipeCount] = useState(null);

  const handleTyping = async (e) => {
    const value = e.target.value;
    setText(value);

    // Only search if the user types more than 2 letters
    if (value.length > 2) {
      try {
        const response = await fetch(`http://localhost:5000/api/check-ingredient?name=${value}`);
        const data = await response.json();
        setRecipeCount(data.count);
      } catch (error) {
        console.error("Connection to backend failed", error);
      }
    } else {
      setRecipeCount(null);
    }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>SmartKitchen Dashboard</h1>
      <div style={{ margin: '20px' }}>
        <input
          type="text"
          placeholder="Type an ingredient (e.g. butter)"
          value={text}
          onChange={handleTyping}
          style={{ padding: '12px', width: '300px', borderRadius: '8px', border: '2px solid #ddd' }}
        />
      </div>

      {recipeCount !== null && (
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2c3e50' }}>
          {recipeCount > 0
            ? `🔥 ${recipeCount} recipes have ${text}`
            : `ℹ️ No recipes found with ${text}`}
        </div>
      )}
    </div>
  );
};

export default IngredientDashboard;