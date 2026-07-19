import client from '../lib/insforge';

export const mealService = {
  generateMealPlan: async (preferences) => {
    const { data, error } = await client.functions.invoke('generate-meal-plan', {
      body: preferences,
    });
    if (error) throw error;
    return { success: true, data: data.data };
  },

  getMealPlans: async (params = {}) => {
    let query = client.database
      .from('meal_plans')
      .select('*')
      .order('date', { ascending: false });
    if (params.limit) query = query.limit(params.limit);
    if (params.favorites) query = query.eq('is_favorite', true);
    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data };
  },

  getMealPlan: async (id) => {
    const { data, error } = await client.database
      .from('meal_plans')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return { success: true, data };
  },

  updateMealPlan: async (id, data) => {
    const { data: result, error } = await client.database
      .from('meal_plans')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data: result };
  },

  deleteMealPlan: async (id) => {
    const { error } = await client.database
      .from('meal_plans')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  toggleFavorite: async (id) => {
    const { data: current } = await client.database
      .from('meal_plans')
      .select('is_favorite')
      .eq('id', id)
      .single();
    const { data, error } = await client.database
      .from('meal_plans')
      .update({ is_favorite: !current.is_favorite, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  },

  generateWeeklyPlan: async (data) => {
    const { data: plan, error } = await client.functions.invoke('generate-meal-plan', {
      body: { ...data, weekly: true },
    });
    if (error) throw error;
    return { success: true, data: plan.data };
  },

  getWeeklyPlans: async () => {
    const { data, error } = await client.database
      .from('weekly_plans')
      .select('*')
      .order('week_start', { ascending: false });
    if (error) throw error;
    return { success: true, data };
  },

  deleteWeeklyPlan: async (id) => {
    const { error } = await client.database
      .from('weekly_plans')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  },
};
