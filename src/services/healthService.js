import client from '../lib/insforge';

export const healthService = {
  createHealthLog: async (data) => {
    const { data: result, error } = await client.database
      .from('health_logs')
      .insert([{
        weight: data.weight,
        water_intake: data.waterIntake,
        calories: data.calories,
        steps: data.steps,
        sleep_hours: data.sleepHours,
        mood: data.mood,
      }])
      .select()
      .single();
    if (error) throw error;
    return { success: true, data: result };
  },

  getHealthLogs: async (params = {}) => {
    let query = client.database
      .from('health_logs')
      .select('*')
      .order('date', { ascending: false });
    if (params.limit) query = query.limit(params.limit);
    if (params.startDate) query = query.gte('date', params.startDate);
    if (params.endDate) query = query.lte('date', params.endDate);
    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data };
  },

  getHealthStats: async (params = {}) => {
    const days = params.days || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const { data, error } = await client.database
      .from('health_logs')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });
    if (error) throw error;
    const stats = {
      avgWeight: data.length ? data.reduce((s, l) => s + (l.weight || 0), 0) / data.length : 0,
      avgWaterIntake: data.length ? data.reduce((s, l) => s + (l.water_intake || 0), 0) / data.length : 0,
      avgCalories: data.length ? Math.round(data.reduce((s, l) => s + (l.calories || 0), 0) / data.length) : 0,
      avgSteps: data.length ? Math.round(data.reduce((s, l) => s + (l.steps || 0), 0) / data.length) : 0,
      avgSleepHours: data.length ? data.reduce((s, l) => s + (l.sleep_hours || 0), 0) / data.length : 0,
      totalLogs: data.length,
      logs: data,
    };
    return { success: true, data: stats };
  },

  updateHealthLog: async (id, data) => {
    const { data: result, error } = await client.database
      .from('health_logs')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data: result };
  },

  deleteHealthLog: async (id) => {
    const { error } = await client.database
      .from('health_logs')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  },
};
