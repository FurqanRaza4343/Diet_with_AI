import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { groceryService } from '../../services/groceryService';
import { mealService } from '../../services/mealService';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash, FaCheck, FaShoppingBag, FaDollarSign, FaFilter, FaCalendarAlt } from 'react-icons/fa';

const GroceryListPage = () => {
  const { user } = useAuth();
  const [groceryLists, setGroceryLists] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedMealPlan, setSelectedMealPlan] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [groceryRes, mealRes] = await Promise.all([
        groceryService.getGroceryLists({ limit: 100 }),
        mealService.getMealPlans({ limit: 20 }),
      ]);
      if (groceryRes.success) setGroceryLists(groceryRes.data);
      if (mealRes.success) setMealPlans(mealRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally { setLoading(false); }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) { toast.error('Please enter a list name'); return; }
    try {
      const response = await groceryService.createGroceryList({ name: newListName, items: [] });
      if (response.success) { toast.success('Grocery list created!'); setNewListName(''); setShowCreate(false); fetchData(); }
    } catch (error) { toast.error('Failed to create grocery list'); }
  };

  const handleGenerateFromMealPlan = async () => {
    if (!selectedMealPlan) { toast.error('Please select a meal plan'); return; }
    try {
      const response = await groceryService.generateFromMealPlan(selectedMealPlan);
      if (response.success) { toast.success('Grocery list generated!'); setShowGenerate(false); setSelectedMealPlan(''); fetchData(); }
    } catch (error) { toast.error('Failed to generate grocery list'); }
  };

  const handleToggleItem = async (listId, itemId) => {
    try {
      const response = await groceryService.toggleItemChecked(listId, itemId);
      if (response.success) { toast.success('Item updated'); fetchData(); }
    } catch (error) { toast.error('Failed to update item'); }
  };

  const handleDeleteList = async (id) => {
    if (!window.confirm('Are you sure you want to delete this grocery list?')) return;
    try {
      const response = await groceryService.deleteGroceryList(id);
      if (response.success) { toast.success('Grocery list deleted'); fetchData(); }
    } catch (error) { toast.error('Failed to delete grocery list'); }
  };

  const allCategories = [...new Set(groceryLists.flatMap(l => (l.items || []).map(i => i.category || 'other')))];
  const filteredLists = groceryLists.map(list => ({
    ...list,
    items: (list.items || []).filter(i => categoryFilter === 'all' || i.category === categoryFilter),
  }));

  const totalCost = (items) => items.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 1), 0);

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Smart Grocery Lists</h1>
            <p className="text-on-surface-variant text-sm mt-1">Generate automatic lists with budget tracking</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowGenerate(!showGenerate)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-[#f6f3f4] text-on-surface hover:bg-[#e5e1e3] flex items-center gap-2">
              <FaCalendarAlt /> From Meal Plan
            </button>
            <button onClick={() => setShowCreate(!showCreate)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
              <FaPlus /> New List
            </button>
          </div>
        </div>

        {showGenerate && (
          <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6 mb-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4">Generate from Meal Plan</h3>
            <div className="flex gap-3">
              <select value={selectedMealPlan} onChange={(e) => setSelectedMealPlan(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 outline-none transition-all">
                <option value="">Select a meal plan...</option>
                {mealPlans.map(mp => (
                  <option key={mp.id} value={mp.id}>{new Date(mp.date).toLocaleDateString()} ({mp.meals?.length || 0} meals)</option>
                ))}
              </select>
              <button onClick={handleGenerateFromMealPlan} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">Generate</button>
              <button onClick={() => setShowGenerate(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors bg-[#f6f3f4] text-on-surface hover:bg-[#e5e1e3]">Cancel</button>
            </div>
          </div>
        )}

        {showCreate && (
          <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6 mb-6">
            <form onSubmit={handleCreateList} className="flex gap-4">
              <input type="text" value={newListName} onChange={(e) => setNewListName(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 outline-none transition-all" placeholder="Enter grocery list name..." required />
              <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">Create</button>
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors bg-[#f6f3f4] text-on-surface hover:bg-[#e5e1e3]">Cancel</button>
            </form>
          </div>
        )}

        {allCategories.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <button onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${categoryFilter === 'all' ? 'bg-primary-600 text-white' : 'bg-[#f6f3f4] text-on-surface hover:bg-[#e5e1e3]'}`}>
              All <FaFilter size={10} className="inline ml-1" />
            </button>
            {allCategories.map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap capitalize transition-colors ${categoryFilter === cat ? 'bg-primary-600 text-white' : 'bg-[#f6f3f4] text-on-surface hover:bg-[#e5e1e3]'}`}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8"><div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div><p className="text-on-surface-variant mt-3 text-sm">Loading grocery lists...</p></div>
        ) : groceryLists.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6 text-center py-12">
            <div className="text-6xl mb-4 flex justify-center"><FaShoppingBag /></div>
            <h3 className="text-xl font-semibold text-on-surface mb-2">No Grocery Lists</h3>
            <p className="text-on-surface-variant">Create a new list or generate from a meal plan!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredLists.map((list) => {
              const cost = totalCost(list.items);
              return (
                <div key={list.id} className="bg-white rounded-2xl border border-[#e5e1e3] p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-on-surface">{list.name}</h3>
                      <p className="text-sm text-on-surface-variant">
                        {list.items?.length || 0} items · {list.items?.filter(i => i.isChecked).length || 0} checked
                        {cost > 0 && <span className="ml-2">· <FaDollarSign size={10} className="inline text-green-600" /> ~${cost.toFixed(2)}</span>}
                      </p>
                    </div>
                    <button onClick={() => handleDeleteList(list.id)} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"><FaTrash /></button>
                  </div>
                  {list.items && list.items.length > 0 && (
                    <div className="space-y-2">
                      {list.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-[#f6f3f4] rounded-xl">
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleToggleItem(list.id, item.id || item._id)}
                              className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${item.isChecked ? 'bg-primary-600 border-primary-600 text-white' : 'border-[#e5e1e3] hover:border-primary-300'}`}>
                              {item.isChecked && <FaCheck className="text-xs" />}
                            </button>
                            <span className={`text-sm ${item.isChecked ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>{item.name}</span>
                            <span className="text-xs text-on-surface-variant">{item.quantity}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.price && <span className="text-xs text-green-600">${(parseFloat(item.price) * parseFloat(item.quantity || 1)).toFixed(2)}</span>}
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">{item.category || 'other'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroceryListPage;
