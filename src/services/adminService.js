import client from '../lib/insforge';

export const adminService = {
  getUsers: async () => {
    const { data: profiles, error } = await client.database
      .from('profiles')
      .select('id, name, goal, created_at');
    if (error) throw error;
    const { data: authUsers, error: authError } = await client.auth.admin.listUsers();
    if (authError) throw authError;
    const users = (authUsers?.users || []).map(au => {
      const profile = (profiles || []).find(p => p.id === au.id);
      return {
        id: au.id,
        _id: au.id,
        email: au.email,
        name: profile?.name || au.user_metadata?.full_name || '',
        role: au.user_metadata?.role || profile?.goal === 'admin' ? 'admin' : 'user',
        createdAt: au.created_at,
        lastSignIn: au.last_sign_in_at,
      };
    });
    return { success: true, data: users };
  },

  getUser: async (id) => {
    const { data: { user }, error } = await client.auth.admin.getUserById(id);
    if (error) throw error;
    const { data: profile } = await client.database
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: profile?.name || '',
        role: user.user_metadata?.role || 'user',
        createdAt: user.created_at,
        ...profile,
      },
    };
  },

  updateUserRole: async (id, role) => {
    const { data, error } = await client.functions.invoke('update-user-role', {
      body: { userId: id, role },
    });
    if (error) throw error;
    return { success: true, data };
  },

  getMealPlans: async () => {
    const { data, error } = await client.database
      .from('meal_plans')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data };
  },

  getStats: async () => {
    const [usersRes, mealPlansRes, weeklyRes] = await Promise.all([
      client.database.from('profiles').select('*', { count: 'exact', head: true }),
      client.database.from('meal_plans').select('*', { count: 'exact', head: true }),
      client.database.from('weekly_plans').select('*', { count: 'exact', head: true }),
    ]);
    return {
      success: true,
      data: {
        totalUsers: usersRes.count || 0,
        totalMealPlans: mealPlansRes.count || 0,
        totalMeals: 0,
        totalWeeklyPlans: weeklyRes.count || 0,
      },
    };
  },
};
