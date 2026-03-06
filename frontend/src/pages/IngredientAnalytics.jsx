import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ingredientsAPI } from '../services/api';

const BAR_COLOR = '#0d9488';

export default function IngredientAnalytics() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    ingredientsAPI
      .getAnalytics()
      .then(setData)
      .catch((err) => setError(err.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-gray-500 hover:text-gray-800 font-medium"
          >
            &larr; Dashboard
          </button>
          <h1 className="text-2xl font-bold text-teal-700">Ingredient Analytics</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-600 mb-8">
          Bar chart showing how many recipes each ingredient appears in.
        </p>

        {loading && (
          <div className="flex justify-center items-center h-64 text-gray-500">
            Loading analytics...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="flex justify-center items-center h-64 text-gray-400">
            No recipe data found. Add some recipes with ingredients first.
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              Ingredient Usage ({data.length} ingredients across all recipes)
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={data}
                margin={{ top: 10, right: 20, left: 0, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="ingredient"
                  angle={-40}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  label={{
                    value: 'Recipes',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10,
                    style: { fontSize: 12, fill: '#6b7280' },
                  }}
                />
                <Tooltip
                  formatter={(value) => [value, 'Recipes']}
                  cursor={{ fill: '#f0fdfa' }}
                />
                <Bar dataKey="recipe_count" radius={[4, 4, 0, 0]}>
                  {data.map((_, index) => (
                    <Cell key={index} fill={BAR_COLOR} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>
    </div>
  );
}
