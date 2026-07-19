import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { mealService } from '../../services/mealService';
import { groceryService } from '../../services/groceryService';
import client from '../../lib/insforge';
import toast from 'react-hot-toast';
import { FaCalendarPlus, FaTrash, FaDownload, FaPrint, FaShoppingBag, FaEye, FaTimes } from 'react-icons/fa';

const WeeklyMealPlannerPage = () => {
  const { user } = useAuth();
  const [weeklyPlans, setWeeklyPlans] = useState([]);
  const userId = user?.id;
  const [loading, setLoading] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [weekStart, setWeekStart] = useState('');
  const [goal, setGoal] = useState('maintain');
  const [dietType, setDietType] = useState('Balanced');
  const [targetCalories, setTargetCalories] = useState(2000);
  const [cuisine, setCuisine] = useState('Any');
  const [activityLevel, setActivityLevel] = useState('moderately-active');
  const [selectedDay, setSelectedDay] = useState(null);
  const [generatingGrocery, setGeneratingGrocery] = useState(false);

  useEffect(() => { fetchWeeklyPlans(); }, []);

  const fetchWeeklyPlans = async () => {
    setLoading(true);
    try {
      const response = await mealService.getWeeklyPlans();
      if (response.success) setWeeklyPlans(response.data);
    } catch (error) { toast.error('Failed to fetch weekly plans'); }
    finally { setLoading(false); }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await mealService.generateWeeklyPlan({
        weekStart: weekStart || new Date().toISOString().split('T')[0], goal,
        dietType, targetCalories, cuisine, activityLevel, mealsPerDay: 3, budget: 'medium',
      });
      if (response.success) { toast.success('Weekly plan generated!'); fetchWeeklyPlans(); setShowGenerate(false); }
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to generate weekly plan'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this weekly plan?')) return;
    try {
      const response = await mealService.deleteWeeklyPlan(id);
      if (response.success) { toast.success('Weekly plan deleted'); fetchWeeklyPlans(); }
    } catch (error) { toast.error('Failed to delete weekly plan'); }
  };

  const handleGenerateGrocery = async (plan) => {
    setGeneratingGrocery(true);
    try {
      const allMeals = (plan.days || []).flatMap(d => {
        const meals = d.meals || {};
        return Object.values(meals).filter(Boolean);
      });
      const ingredients = allMeals
        .flatMap(m => m.ingredients || [])
        .filter(i => i && i.name);
      const unique = [...new Map(ingredients.map(i => [i.name.toLowerCase(), {
        name: i.name,
        quantity: i.quantity || '1',
        category: i.category || 'other',
        price: i.price || 0,
      }])).values()];
      if (unique.length === 0) { toast.error('No ingredients found in this plan'); return; }
      await client.database.from('grocery_lists').insert([{
        user_id: userId,
        name: `Grocery from ${new Date(plan.weekStart).toLocaleDateString()} week plan`,
        items: unique.map(i => ({ ...i, isChecked: false })),
      }]);
      toast.success('Grocery list generated from weekly plan!');
      fetchWeeklyPlans();
    } catch (error) { toast.error('Failed to generate grocery list'); }
    finally { setGeneratingGrocery(false); }
  };

  const handlePrint = (plan) => {
    const printWindow = window.open('', '_blank');
    const daysHtml = (plan.days || []).map(d => {
      const meals = d.meals ? Object.entries(d.meals).map(([type, m]) =>
        `<div style="margin-bottom:8px"><strong>${type.charAt(0).toUpperCase() + type.slice(1)}:</strong> ${m.name} (${m.calories || 0} kcal)</div>`
      ).join('') : '';
      return `<div style="margin-bottom:20px;break-inside:avoid"><h3 style="color:#22c55e;margin-bottom:8px">${d.day}</h3>${meals}
        ${d.totalCalories ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e1e3"><strong>Total:</strong> ${d.totalCalories} kcal</div>` : ''}</div>`;
    }).join('');
    printWindow.document.write(`
      <html><head><title>Weekly Meal Plan</title>
      <style>body{font-family:Inter,sans-serif;padding:40px;color:#1c1b1c;background:#fcf8fa}
      h1{color:#22c55e}h2{color:#1c1b1c;margin-top:30px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px}
      @media print{body{padding:20px}}</style></head>
      <body><h1>Weekly Meal Plan</h1>
      <p style="color:#77767d">Week of ${new Date(plan.weekStart).toLocaleDateString()} · Goal: ${plan.goal}</p>
      <div class="grid">${daysHtml}</div>
      ${plan.weeklySummary ? `<h2>Summary</h2>
      <p>Avg Calories: ${plan.weeklySummary.avgCalories || 0} kcal</p>
      <p>Total Protein: ${plan.weeklySummary.totalProtein || 0}g</p>
      <p>Total Carbs: ${plan.weeklySummary.totalCarbs || 0}g</p>
      <p>Total Fat: ${plan.weeklySummary.totalFat || 0}g</p>` : ''}
      <script>window.print()</script></body></html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Weekly Meal Plans</h1>
            <p className="text-on-surface-variant text-sm mt-1">Plan balanced meals for the entire week</p>
          </div>
          <button onClick={() => setShowGenerate(!showGenerate)} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
            <FaCalendarPlus /> Generate Weekly Plan
          </button>
        </div>

        {showGenerate && (
          <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6 mb-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4">Generate New Weekly Plan</h3>
            <form onSubmit={handleGenerate} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Week Start Date</label>
                <input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 outline-none transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Goal</label>
                <select value={goal} onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 outline-none transition-all">
                  <option value="lose-weight">Lose Weight</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="gain-muscle">Gain Muscle</option>
                  <option value="improve-health">Improve Health</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Diet Type</label>
                <select value={dietType} onChange={(e) => setDietType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 outline-none transition-all">
                  <option value="Balanced">Balanced</option>
                  <option value="Keto">Keto</option>
                  <option value="Paleo">Paleo</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Mediterranean">Mediterranean</option>
                  <option value="Low-Carb">Low-Carb</option>
                  <option value="High-Protein">High-Protein</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Target Calories/day</label>
                <input type="number" min="1200" max="4000" step="100" value={targetCalories}
                  onChange={(e) => setTargetCalories(parseInt(e.target.value) || 2000)}
                  className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Cuisine</label>
                <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 outline-none transition-all">
                  <option value="Any">Any</option>
                  <option value="Italian">Italian</option>
                  <option value="Mexican">Mexican</option>
                  <option value="Asian">Asian</option>
                  <option value="Indian">Indian</option>
                  <option value="Pakistani">Pakistani</option>
                  <option value="American">American</option>
                  <option value="Mediterranean">Mediterranean</option>
                  <option value="Middle Eastern">Middle Eastern</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Activity Level</label>
                <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 outline-none transition-all">
                  <option value="sedentary">Sedentary</option>
                  <option value="lightly-active">Lightly Active</option>
                  <option value="moderately-active">Moderately Active</option>
                  <option value="very-active">Very Active</option>
                  <option value="extremely-active">Extremely Active</option>
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-3 flex gap-3">
                <button type="submit" className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors" disabled={loading}>
                  {loading ? 'Generating...' : 'Generate Plan'}
                </button>
                <button type="button" onClick={() => setShowGenerate(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors bg-[#f6f3f4] text-on-surface hover:bg-[#e5e1e3]">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8"><div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div><p className="text-on-surface-variant mt-3 text-sm">Loading weekly plans...</p></div>
        ) : weeklyPlans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6 text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-on-surface mb-2">No Weekly Plans Yet</h3>
            <p className="text-on-surface-variant">Generate your first weekly meal plan to get started!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {weeklyPlans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-2xl border border-[#e5e1e3] p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-on-surface">Week of {new Date(plan.weekStart).toLocaleDateString()}</h3>
                    <p className="text-sm text-on-surface-variant">{plan.days?.length || 0} days · Goal: {plan.goal?.replace('-', ' ')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleGenerateGrocery(plan)} disabled={generatingGrocery}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#f6f3f4] text-on-surface hover:bg-[#e5e1e3] transition-colors flex items-center gap-1">
                      <FaShoppingBag /> {generatingGrocery ? '...' : 'Groceries'}
                    </button>
                    <button onClick={() => handlePrint(plan)} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#f6f3f4] text-on-surface hover:bg-[#e5e1e3] transition-colors"><FaPrint /></button>
                    <button onClick={() => handleDelete(plan.id)} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"><FaTrash /></button>
                  </div>
                </div>

                {plan.days && plan.days.length > 0 && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {plan.days.map((day, index) => (
                      <div key={index}
                        className="bg-[#f6f3f4] rounded-xl p-4 cursor-pointer hover:bg-[#e5e1e3] transition-colors"
                        onClick={() => setSelectedDay(selectedDay?.day === day.day && selectedDay?.planId === plan.id ? null : { ...day, planId: plan.id })}
                      >
                        <h4 className="font-semibold text-primary-600 mb-2 text-sm">{day.day}</h4>
                        {day.meals && (
                          <div className="space-y-1.5 text-sm">
                            {day.meals.breakfast && <div className="flex justify-between"><span className="text-on-surface-variant text-xs">Breakfast</span><span className="text-on-surface text-xs">{day.meals.breakfast.name}</span></div>}
                            {day.meals.lunch && <div className="flex justify-between"><span className="text-on-surface-variant text-xs">Lunch</span><span className="text-on-surface text-xs">{day.meals.lunch.name}</span></div>}
                            {day.meals.dinner && <div className="flex justify-between"><span className="text-on-surface-variant text-xs">Dinner</span><span className="text-on-surface text-xs">{day.meals.dinner.name}</span></div>}
                            {day.totalCalories && <div className="mt-1.5 pt-1.5 border-t border-[#e5e1e3] text-right"><span className="text-xs font-semibold text-primary-600">{day.totalCalories} kcal</span></div>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {selectedDay && selectedDay.planId === plan.id && selectedDay.meals && (
                  <div className="mt-4 bg-white border border-primary-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-on-surface">{selectedDay.day} Details</h4>
                      <button onClick={() => setSelectedDay(null)} className="text-on-surface-variant hover:text-on-surface"><FaTimes /></button>
                    </div>
                    <div className="space-y-3">
                      {selectedDay.meals.breakfast && (
                        <div className="bg-[#fcf8fa] rounded-xl p-3">
                          <p className="text-xs font-medium text-primary-600 mb-1">Breakfast</p>
                          <p className="text-sm font-medium text-on-surface">{selectedDay.meals.breakfast.name}</p>
                          {selectedDay.meals.breakfast.calories && <p className="text-xs text-on-surface-variant">{selectedDay.meals.breakfast.calories} kcal</p>}
                          {selectedDay.meals.breakfast.ingredients && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedDay.meals.breakfast.ingredients.map((ing, j) => (
                                <span key={j} className="text-xs bg-white px-2 py-0.5 rounded text-on-surface-variant">{ing.name || ing}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {selectedDay.meals.lunch && (
                        <div className="bg-[#fcf8fa] rounded-xl p-3">
                          <p className="text-xs font-medium text-primary-600 mb-1">Lunch</p>
                          <p className="text-sm font-medium text-on-surface">{selectedDay.meals.lunch.name}</p>
                          {selectedDay.meals.lunch.calories && <p className="text-xs text-on-surface-variant">{selectedDay.meals.lunch.calories} kcal</p>}
                          {selectedDay.meals.lunch.ingredients && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedDay.meals.lunch.ingredients.map((ing, j) => (
                                <span key={j} className="text-xs bg-white px-2 py-0.5 rounded text-on-surface-variant">{ing.name || ing}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {selectedDay.meals.dinner && (
                        <div className="bg-[#fcf8fa] rounded-xl p-3">
                          <p className="text-xs font-medium text-primary-600 mb-1">Dinner</p>
                          <p className="text-sm font-medium text-on-surface">{selectedDay.meals.dinner.name}</p>
                          {selectedDay.meals.dinner.calories && <p className="text-xs text-on-surface-variant">{selectedDay.meals.dinner.calories} kcal</p>}
                          {selectedDay.meals.dinner.ingredients && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedDay.meals.dinner.ingredients.map((ing, j) => (
                                <span key={j} className="text-xs bg-white px-2 py-0.5 rounded text-on-surface-variant">{ing.name || ing}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {selectedDay.meals.snacks && selectedDay.meals.snacks.length > 0 && (
                        <div className="bg-[#fcf8fa] rounded-xl p-3">
                          <p className="text-xs font-medium text-primary-600 mb-1">Snacks</p>
                          {selectedDay.meals.snacks.map((s, j) => (
                            <div key={j} className="flex justify-between">
                              <span className="text-sm text-on-surface">{s.name}</span>
                              <span className="text-xs text-on-surface-variant">{s.calories || 0} kcal</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedDay.totalCalories && (
                      <div className="mt-3 pt-3 border-t border-[#e5e1e3] flex justify-between">
                        <span className="text-sm font-semibold text-on-surface">Total</span>
                        <span className="text-sm font-bold text-primary-600">{selectedDay.totalCalories} kcal</span>
                      </div>
                    )}
                  </div>
                )}

                {plan.weeklySummary && (
                  <div className="mt-4 pt-4 border-t border-[#e5e1e3] grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><span className="text-on-surface-variant">Avg Calories</span><p className="font-semibold text-primary-600">{plan.weeklySummary.avgCalories || 0} kcal</p></div>
                    <div><span className="text-on-surface-variant">Total Protein</span><p className="font-semibold text-primary-600">{plan.weeklySummary.totalProtein || 0}g</p></div>
                    <div><span className="text-on-surface-variant">Total Carbs</span><p className="font-semibold text-primary-600">{plan.weeklySummary.totalCarbs || 0}g</p></div>
                    <div><span className="text-on-surface-variant">Total Fat</span><p className="font-semibold text-primary-600">{plan.weeklySummary.totalFat || 0}g</p></div>
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

export default WeeklyMealPlannerPage;
