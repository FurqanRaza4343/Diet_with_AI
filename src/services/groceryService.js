import client from '../lib/insforge';

export const groceryService = {
  createGroceryList: async (data) => {
    const { data: result, error } = await client.database
      .from('grocery_lists')
      .insert([{
        name: data.name,
        items: data.items || [],
      }])
      .select()
      .single();
    if (error) throw error;
    return { success: true, data: result };
  },

  generateFromMealPlan: async (mealPlanId) => {
    const { data: mealPlan, error: mealError } = await client.database
      .from('meal_plans')
      .select('*')
      .eq('id', mealPlanId)
      .single();
    if (mealError) throw mealError;
    const ingredients = (mealPlan.meals || []).flatMap(meal => meal.ingredients || []);
    const unique = [...new Map(ingredients.map(i => [i.name, i])).values()];
    const { data: result, error } = await client.database
      .from('grocery_lists')
      .insert([{
        name: `Grocery list from ${new Date(mealPlan.date).toLocaleDateString()}`,
        items: unique.map(i => ({ name: i.name, quantity: i.quantity || '1', category: i.category || 'other', isChecked: false })),
      }])
      .select()
      .single();
    if (error) throw error;
    return { success: true, data: result };
  },

  getGroceryLists: async (params = {}) => {
    let query = client.database
      .from('grocery_lists')
      .select('*')
      .order('created_at', { ascending: false });
    if (params.limit) query = query.limit(params.limit);
    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data };
  },

  getGroceryList: async (id) => {
    const { data, error } = await client.database
      .from('grocery_lists')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return { success: true, data };
  },

  updateGroceryList: async (id, data) => {
    const { data: result, error } = await client.database
      .from('grocery_lists')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data: result };
  },

  toggleItemChecked: async (id, itemId) => {
    const { data: list } = await client.database
      .from('grocery_lists')
      .select('items')
      .eq('id', id)
      .single();
    const items = (list.items || []).map(item => {
      if (item.id === itemId || item._id === itemId) {
        return { ...item, isChecked: !item.isChecked };
      }
      return item;
    });
    const { data: result, error } = await client.database
      .from('grocery_lists')
      .update({ items, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data: result };
  },

  deleteGroceryList: async (id) => {
    const { error } = await client.database
      .from('grocery_lists')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  },
};
