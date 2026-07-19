import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { mealService } from '../../services/mealService';
import toast from 'react-hot-toast';
import { FaSearch, FaStar, FaRegStar, FaDownload, FaTrash } from 'react-icons/fa';

const MealHistoryPage = () => {
  const { user } = useAuth();
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchMealPlans(); }, []);

  const fetchMealPlans = async () => {
    setLoading(true);
    try {
      const response = await mealService.getMealPlans({ limit: 100 });
      if (response.success) setMealPlans(response.data);
    } catch (error) {
      toast.error('Failed to fetch meal plans');
    } finally { setLoading(false); }
  };

  const handleToggleFavorite = async (id) => {
    try {
      const response = await mealService.toggleFavorite(id);
      if (response.success) {
        toast.success(response.data.isFavorite ? 'Added to favorites' : 'Removed from favorites');
        fetchMealPlans();
      }
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meal plan?')) return;
    try {
      const response = await mealService.deleteMealPlan(id);
      if (response.success) { toast.success('Meal plan deleted'); fetchMealPlans(); }
    } catch (error) {
      toast.error('Failed to delete meal plan');
    }
  };

  const filteredPlans = mealPlans.filter(plan => {
    const matchesSearch = plan.meals?.some(meal => meal.name?.toLowerCase().includes(search.toLowerCase())) || plan.date?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'favorites' && plan.isFavorite);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-on-surface mb-8">Meal History</h1>

        <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all" placeholder="Search meal plans..." />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setFilter('all')} className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-[#f6f3f4] text-on-surface hover:bg-[#e5e1e3]'}`}>All</button>
              <button onClick={() => setFilter('favorites')} className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1 ${filter === 'favorites' ? 'bg-primary-600 text-white' : 'bg-[#f6f3f4] text-on-surface hover:bg-[#e5e1e3]'}`}><FaStar /> Favorites</button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8"><div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div><p className="text-on-surface-variant mt-3 text-sm">Loading meal plans...</p></div>
        ) : filteredPlans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6 text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-on-surface mb-2">No Meal Plans Found</h3>
            <p className="text-on-surface-variant">Generate your first AI meal plan to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPlans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-2xl border border-[#e5e1e3] p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-on-surface">{new Date(plan.date).toLocaleDateString()}</h3>
                      <button onClick={() => handleToggleFavorite(plan.id)} className="text-amber-500 hover:scale-110 transition-transform">
                        {plan.isFavorite ? <FaStar /> : <FaRegStar />}
                      </button>
                    </div>
                    <p className="text-sm text-on-surface-variant">{plan.meals?.length || 0} meals · {plan.totalCalories || 0} kcal total</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#f6f3f4] text-on-surface hover:bg-[#e5e1e3] transition-colors"><FaDownload /></button>
                    <button onClick={() => handleDelete(plan.id)} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"><FaTrash /></button>
                  </div>
                </div>
                {plan.meals && plan.meals.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {plan.meals.slice(0, 4).map((meal, index) => (
                      <div key={index} className="bg-[#f6f3f4] rounded-xl p-3">
                        <p className="font-medium text-sm text-on-surface">{meal.name}</p>
                        <p className="text-xs text-on-surface-variant">{meal.calories || 0} kcal</p>
                      </div>
                    ))}
                    {plan.meals.length > 4 && (
                      <div className="bg-[#f6f3f4] rounded-xl p-3 flex items-center justify-center">
                        <p className="text-xs text-on-surface-variant">+{plan.meals.length - 4} more</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MealHistoryPage;
