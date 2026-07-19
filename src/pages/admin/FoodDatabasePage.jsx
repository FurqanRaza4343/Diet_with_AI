import React, { useState, useEffect } from 'react';
import client from '../../lib/insforge';
import toast from 'react-hot-toast';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const initialForm = { name: '', category: 'other', calories: '', protein: '', carbs: '', fat: '', serving_size: '100g', image_url: '' };

const FoodDatabasePage = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => { fetchFoods(); }, []);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const { data, error } = await client.database.from('food_database').select('*').order('name');
      if (error) throw error;
      setFoods(data || []);
    } catch (err) {
      toast.error('Failed to fetch food database');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name, category: form.category, calories: parseFloat(form.calories) || 0,
        protein: parseFloat(form.protein) || 0, carbs: parseFloat(form.carbs) || 0,
        fat: parseFloat(form.fat) || 0, serving_size: form.serving_size, image_url: form.image_url,
      };
      if (editing) {
        const { error } = await client.database.from('food_database').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editing);
        if (error) throw error;
        toast.success('Food item updated');
      } else {
        const { error } = await client.database.from('food_database').insert([payload]);
        if (error) throw error;
        toast.success('Food item added');
      }
      setShowForm(false); setEditing(null); setForm(initialForm); fetchFoods();
    } catch (err) {
      toast.error(err.message || 'Failed to save food item');
    }
  };

  const handleEdit = (food) => {
    setForm({ name: food.name, category: food.category, calories: food.calories.toString(), protein: food.protein.toString(), carbs: food.carbs.toString(), fat: food.fat.toString(), serving_size: food.serving_size, image_url: food.image_url || '' });
    setEditing(food.id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this food item?')) return;
    try {
      const { error } = await client.database.from('food_database').delete().eq('id', id);
      if (error) throw error;
      toast.success('Food item deleted'); fetchFoods();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const filtered = foods.filter(f => f.name?.toLowerCase().includes(search.toLowerCase()) || f.category?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-on-surface">Food Database</h1>
          <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm(initialForm); }} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
            <FaPlus /> Add Food
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6 mb-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4">{editing ? 'Edit Food Item' : 'Add New Food Item'}</h3>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all">
                  {['fruits', 'vegetables', 'grains', 'protein', 'dairy', 'fats', 'snacks', 'beverages', 'spices', 'other'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Serving Size</label>
                <input type="text" value={form.serving_size} onChange={(e) => setForm({ ...form, serving_size: e.target.value })} className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Calories</label>
                <input type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all" step="0.1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Protein (g)</label>
                <input type="number" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all" step="0.1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Carbs (g)</label>
                <input type="number" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all" step="0.1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Fat (g)</label>
                <input type="number" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all" step="0.1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Image URL</label>
                <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all" placeholder="https://..." />
              </div>
              <div className="md:col-span-3 flex gap-3">
                <button type="submit" className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"><FaSave /> {editing ? 'Update' : 'Add'} Food</button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors bg-[#f6f3f4] text-on-surface hover:bg-[#e5e1e3] flex items-center gap-2"><FaTimes /> Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6 mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all" placeholder="Search food items..." />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-on-surface-variant text-sm border-b border-[#e5e1e3]">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium text-right">Calories</th>
                  <th className="pb-3 font-medium text-right">Protein</th>
                  <th className="pb-3 font-medium text-right">Carbs</th>
                  <th className="pb-3 font-medium text-right">Fat</th>
                  <th className="pb-3 font-medium text-right">Serving</th>
                  <th className="pb-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" className="text-center py-8 text-on-surface-variant">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-8 text-on-surface-variant">No food items found</td></tr>
                ) : (
                  filtered.map((food) => (
                    <tr key={food.id} className="border-b border-[#e5e1e3] last:border-0">
                      <td className="py-3 text-on-surface font-medium">{food.name}</td>
                      <td className="py-3"><span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">{food.category}</span></td>
                      <td className="py-3 text-right text-on-surface">{food.calories}</td>
                      <td className="py-3 text-right text-on-surface-variant">{food.protein}g</td>
                      <td className="py-3 text-right text-on-surface-variant">{food.carbs}g</td>
                      <td className="py-3 text-right text-on-surface-variant">{food.fat}g</td>
                      <td className="py-3 text-right text-on-surface-variant text-sm">{food.serving_size}</td>
                      <td className="py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => handleEdit(food)} className="text-primary-600 hover:text-primary-700"><FaEdit /></button>
                          <button onClick={() => handleDelete(food.id)} className="text-red-500 hover:text-red-600"><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDatabasePage;
