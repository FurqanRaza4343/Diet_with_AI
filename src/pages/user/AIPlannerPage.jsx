import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { mealService } from '../../services/mealService';
import toast from 'react-hot-toast';
import { Sparkles, ChevronRight, ChevronLeft, RotateCcw, ChevronDown, ChevronUp, Flame, Apple, Dumbbell, Utensils } from 'lucide-react';

const dietTypes = ['Balanced', 'Keto', 'Paleo', 'Vegan', 'Vegetarian', 'Mediterranean', 'Low-Carb', 'High-Protein', 'DASH', 'Diabetic-Friendly'];
const cuisineOptions = ['Any', 'Italian', 'Mexican', 'Chinese', 'Japanese', 'Korean', 'Thai', 'Indian', 'Pakistani', 'American', 'Mediterranean', 'Middle Eastern', 'French', 'Spanish', 'African', 'Caribbean'];
const mealCounts = [2, 3, 4, 5, 6];
const goals = ['lose-weight', 'maintain', 'gain-muscle', 'improve-health'];
const activityLevels = ['sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extremely-active'];
const cookingTimeOptions = ['any', 'quick', 'moderate'];

const AIPlannerPage = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [prefs, setPrefs] = useState({ dietType: 'Balanced', goal: 'maintain', calories: 2000, allergies: '', cuisine: 'Any', mealsPerDay: 3, budget: 'medium', activityLevel: 'moderately-active', cookingTime: 'any', excludedIngredients: '' });

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await mealService.getMealPlans({ limit: 20 });
      if (res.success) setHistory(res.data || []);
    } catch {} finally { setLoadingHistory(false); }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGeneratedPlan(null);
    try {
      const res = await mealService.generateMealPlan({
        dietType: prefs.dietType, goal: prefs.goal, targetCalories: prefs.calories,
        allergies: prefs.allergies.split(',').map(s => s.trim()).filter(Boolean),
        cuisine: prefs.cuisine, mealsPerDay: prefs.mealsPerDay, budget: prefs.budget,
        activityLevel: prefs.activityLevel, cookingTime: prefs.cookingTime,
        excludedIngredients: prefs.excludedIngredients.split(',').map(s => s.trim()).filter(Boolean),
      });
      if (res.success) { setGeneratedPlan(res.data); setStep(4); toast.success('Meal plan generated!'); fetchHistory(); }
    } catch (err) { toast.error(err.message || 'Failed to generate plan'); }
    finally { setGenerating(false); }
  };

  const totalCals = generatedPlan?.meals?.reduce((s, m) => s + (m.calories || 0), 0) || generatedPlan?.totalCalories || 0;
  const totalProtein = generatedPlan?.meals?.reduce((s, m) => s + (m.protein || 0), 0) || generatedPlan?.totalProtein || 0;
  const totalCarbs = generatedPlan?.meals?.reduce((s, m) => s + (m.carbs || 0), 0) || generatedPlan?.totalCarbs || 0;
  const totalFat = generatedPlan?.meals?.reduce((s, m) => s + (m.fat || 0), 0) || generatedPlan?.totalFat || 0;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center">
          <Sparkles className="text-primary-600" size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">AI-Powered Planning</h1>
          <p className="text-on-surface-variant text-sm">Personalized meal plans tailored to your goals</p>
        </div>
      </div>

      {!generatedPlan ? (
        <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6 max-w-2xl">
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-primary-600 text-white' : 'bg-[#f1edee] text-on-surface-variant'}`}>{s}</div>
                {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-primary-600' : 'bg-[#e5e1e3]'}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg font-semibold text-on-surface mb-4">What's your goal?</h2>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {goals.map(g => (
                    <button key={g} onClick={() => setPrefs({ ...prefs, goal: g })}
                      className={`p-4 rounded-xl border text-left transition-all ${prefs.goal === g ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200' : 'border-[#e5e1e3] hover:border-primary-200'}`}
                    >
                      <p className="font-medium text-on-surface text-sm capitalize">{g.replace('-', ' ')}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {g === 'lose-weight' ? 'Calorie deficit focus' : g === 'maintain' ? 'Balanced nutrition' : g === 'gain-muscle' ? 'High protein' : 'Nutrient-dense'}
                      </p>
                    </button>
                  ))}
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-on-surface mb-2">Target Calories</label>
                  <input type="range" min="1200" max="4000" step="100" value={prefs.calories}
                    onChange={e => setPrefs({ ...prefs, calories: parseInt(e.target.value) })}
                    className="w-full accent-primary-600" />
                  <div className="flex justify-between text-sm text-on-surface-variant mt-1">
                    <span>1200</span>
                    <span className="font-semibold text-primary-600">{prefs.calories} kcal</span>
                    <span>4000</span>
                  </div>
                </div>
                <button onClick={() => setStep(2)} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                  Next <ChevronRight size={16} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg font-semibold text-on-surface mb-4">Dietary Preferences</h2>
                <label className="block text-sm font-medium text-on-surface mb-2">Diet Type</label>
                <div className="flex flex-wrap gap-2 mb-5">
                  {dietTypes.map(d => (
                    <button key={d} onClick={() => setPrefs({ ...prefs, dietType: d })}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${prefs.dietType === d ? 'bg-primary-600 text-white' : 'bg-[#f6f3f4] text-on-surface hover:bg-[#e5e1e3]'}`}
                    >{d}</button>
                  ))}
                </div>
                <label className="block text-sm font-medium text-on-surface mb-2">Cuisine Preference</label>
                <div className="flex flex-wrap gap-2 mb-5">
                  {cuisineOptions.map(c => (
                    <button key={c} onClick={() => setPrefs({ ...prefs, cuisine: c })}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${prefs.cuisine === c ? 'bg-primary-600 text-white' : 'bg-[#f6f3f4] text-on-surface hover:bg-[#e5e1e3]'}`}
                    >{c}</button>
                  ))}
                </div>
                <label className="block text-sm font-medium text-on-surface mb-2">Allergies (comma separated)</label>
                <input type="text" value={prefs.allergies} onChange={e => setPrefs({ ...prefs, allergies: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all mb-5" placeholder="peanuts, dairy, gluten" />
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors bg-[#f6f3f4] text-on-surface hover:bg-[#e5e1e3] flex items-center gap-2">
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button onClick={() => setStep(3)} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg font-semibold text-on-surface mb-4">Meal Preferences</h2>
                <label className="block text-sm font-medium text-on-surface mb-2">Meals Per Day</label>
                <div className="flex gap-3 mb-5">
                  {mealCounts.map(m => (
                    <button key={m} onClick={() => setPrefs({ ...prefs, mealsPerDay: m })}
                      className={`flex-1 p-4 rounded-xl border text-center transition-all ${prefs.mealsPerDay === m ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200' : 'border-[#e5e1e3] hover:border-primary-200'}`}
                    >
                      <span className="text-lg font-bold text-on-surface">{m}</span>
                      <p className="text-xs text-on-surface-variant">meals</p>
                    </button>
                  ))}
                </div>
                <label className="block text-sm font-medium text-on-surface mb-2">Activity Level</label>
                <div className="flex flex-wrap gap-2 mb-5">
                  {activityLevels.map(a => (
                    <button key={a} onClick={() => setPrefs({ ...prefs, activityLevel: a })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${prefs.activityLevel === a ? 'bg-primary-600 text-white' : 'bg-[#f6f3f4] text-on-surface hover:bg-[#e5e1e3]'}`}
                    >{a.replace('-', ' ')}</button>
                  ))}
                </div>
                <label className="block text-sm font-medium text-on-surface mb-2">Cooking Time Preference</label>
                <div className="flex gap-3 mb-5">
                  {cookingTimeOptions.map(c => (
                    <button key={c} onClick={() => setPrefs({ ...prefs, cookingTime: c })}
                      className={`flex-1 p-3 rounded-xl border text-center capitalize transition-all ${prefs.cookingTime === c ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200' : 'border-[#e5e1e3] hover:border-primary-200'}`}
                    ><span className="font-medium text-on-surface text-sm">{c}</span></button>
                  ))}
                </div>
                <label className="block text-sm font-medium text-on-surface mb-2">Budget</label>
                <div className="flex gap-3 mb-5">
                  {['low', 'medium', 'high'].map(b => (
                    <button key={b} onClick={() => setPrefs({ ...prefs, budget: b })}
                      className={`flex-1 p-3 rounded-xl border text-center capitalize transition-all ${prefs.budget === b ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200' : 'border-[#e5e1e3] hover:border-primary-200'}`}
                    ><span className="font-medium text-on-surface text-sm">{b}</span></button>
                  ))}
                </div>
                <label className="block text-sm font-medium text-on-surface mb-2">Excluded Ingredients (comma separated)</label>
                <input type="text" value={prefs.excludedIngredients} onChange={e => setPrefs({ ...prefs, excludedIngredients: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all mb-6" placeholder="chicken, mushroom, eggs" />
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors bg-[#f6f3f4] text-on-surface hover:bg-[#e5e1e3] flex items-center gap-2">
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button onClick={handleGenerate} disabled={generating}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                    {generating ? <>Generating <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></> : <><Sparkles size={16} /> Generate Plan</>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-on-surface">Your Meal Plan</h2>
            <button onClick={() => { setGeneratedPlan(null); setStep(1); }}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-[#f6f3f4] text-on-surface hover:bg-[#e5e1e3] flex items-center gap-2">
              <RotateCcw size={14} /> New Plan
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Calories', value: `${totalCals} kcal`, icon: Flame, color: 'text-amber-600' },
              { label: 'Protein', value: `${totalProtein}g`, icon: Dumbbell, color: 'text-primary-600' },
              { label: 'Carbs', value: `${totalCarbs}g`, icon: Apple, color: 'text-green-600' },
              { label: 'Fat', value: `${totalFat}g`, icon: Utensils, color: 'text-blue-600' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#e5e1e3] p-4">
                <div className="flex items-center gap-2">
                  <s.icon size={16} className={s.color} />
                  <span className="text-xs text-on-surface-variant">{s.label}</span>
                </div>
                <p className="text-lg font-bold text-on-surface mt-1">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3 mb-8">
            {generatedPlan.meals?.map((meal, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#e5e1e3] p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">{i + 1}</span>
                    <div>
                      <h3 className="font-semibold text-on-surface">{meal.name}</h3>
                      <p className="text-xs text-on-surface-variant capitalize">{meal.type || 'meal'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-on-surface">{meal.calories || 0} kcal</p>
                    <p className="text-xs text-on-surface-variant">P: {meal.protein || 0}g · C: {meal.carbs || 0}g · F: {meal.fat || 0}g</p>
                    {(meal.fiber || meal.sugar) && (
                      <p className="text-xs text-on-surface-variant">Fiber: {meal.fiber || 0}g · Sugar: {meal.sugar || 0}g</p>
                    )}
                  </div>
                </div>
                {meal.prepTime && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-on-surface-variant">
                    <span>⏱ {meal.prepTime}</span>
                  </div>
                )}
                {meal.ingredients && meal.ingredients.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#e5e1e3]">
                    <p className="text-xs font-medium text-on-surface-variant mb-1.5">Ingredients</p>
                    <div className="flex flex-wrap gap-1.5">
                      {meal.ingredients.map((ing, j) => (
                        <span key={j} className="text-xs bg-[#f6f3f4] px-2 py-1 rounded-lg text-on-surface-variant">{ing.name} {ing.quantity || ''}</span>
                      ))}
                    </div>
                  </div>
                )}
                {meal.cookingInstructions && (
                  <div className="mt-3 pt-3 border-t border-[#e5e1e3]">
                    <p className="text-xs font-medium text-on-surface-variant mb-1">Instructions</p>
                    <p className="text-xs text-on-surface leading-relaxed">{meal.cookingInstructions}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6 mt-8">
        <h3 className="text-lg font-semibold text-on-surface mb-4">Past Meal Plans</h3>
        {loadingHistory ? (
          <div className="text-center py-8"><div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-on-surface-variant text-sm">No past meal plans yet</div>
        ) : (
          <div className="space-y-3">
            {history.map((plan) => (
              <div key={plan.id}>
                <button onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                  className="w-full flex items-center justify-between p-3 bg-[#f6f3f4] rounded-xl text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-on-surface">{new Date(plan.date).toLocaleDateString()}</span>
                    <span className="text-xs text-on-surface-variant">{plan.meals?.length || 0} meals</span>
                    <span className="text-xs font-medium text-primary-600">{plan.total_calories || 0} kcal</span>
                  </div>
                  {expandedPlan === plan.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {expandedPlan === plan.id && plan.meals && (
                  <div className="mt-2 space-y-2 pl-4">
                    {plan.meals.map((m, j) => (
                      <div key={j} className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#e5e1e3]">
                        <span className="text-sm text-on-surface">{m.name}</span>
                        <span className="text-xs text-on-surface-variant">{m.calories || 0} kcal</span>
                      </div>
                    ))}
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

export default AIPlannerPage;
