import client from '../lib/insforge';

export const userService = {
  getProfile: async () => {
    const { data: { user } } = await client.auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    const { data: profile, error } = await client.database
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) throw error;
    return { success: true, user: { id: user.id, email: user.email, ...profile } };
  },

  updateProfile: async (data) => {
    const { data: { user } } = await client.auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    const { data: profile, error } = await client.database
      .from('profiles')
      .update({
        name: data.name,
        goal: data.goal,
        dietary_preferences: data.dietaryPreferences || data.dietary_preferences,
        allergies: data.allergies,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    return { success: true, user: { id: user.id, email: user.email, ...profile } };
  },

  getStats: async () => {
    const { data: { user } } = await client.auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    const [mealPlans, healthLogs, groceryLists] = await Promise.all([
      client.database.from('meal_plans').select('*', { count: 'exact', head: true }),
      client.database.from('health_logs').select('*', { count: 'exact', head: true }),
      client.database.from('grocery_lists').select('*', { count: 'exact', head: true }),
    ]);
    return {
      success: true,
      data: {
        mealPlans: mealPlans.count || 0,
        healthLogs: healthLogs.count || 0,
        groceryLists: groceryLists.count || 0,
      },
    };
  },
};
