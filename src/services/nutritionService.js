import client from '../lib/insforge';

const uuidv4 = () => {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  arr[6] = (arr[6] & 0x0f) | 0x40;
  arr[8] = (arr[8] & 0x3f) | 0x80;
  return [...arr].map(b => b.toString(16).padStart(2, '0')).join('').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
};

export const nutritionService = {
  analyzeFoodByName: async (foodName, language = 'en') => {
    const { data, error } = await client.functions.invoke('analyze-image', {
      body: { foodName, language },
    });
    if (error) throw error;
    return { success: true, data: data.data };
  },

  analyzeFood: async (text, language = 'en') => {
    const { data, error } = await client.functions.invoke('analyze-food', {
      body: { text, language },
    });
    if (error) throw error;
    return { success: true, data: data.data };
  },

  analyzeFoodImage: async (imageFile, language = 'en') => {
    const fileExt = imageFile.name.split('.').pop();
    const filePath = `${uuidv4()}.${fileExt}`;
    const { error: uploadError } = await client.storage
      .from('food-images')
      .upload(filePath, imageFile);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = client.storage
      .from('food-images')
      .getPublicUrl(filePath);
    const { data, error } = await client.functions.invoke('analyze-image', {
      body: { imageUrl: publicUrl, language },
    });
    if (error) throw error;
    return { success: true, data: data.data };
  },

  getAnalysisHistory: async (page = 1, limit = 10) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await client.database
      .from('nutrition_analyses')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    return { success: true, data, count };
  },

  getAnalysis: async (id) => {
    const { data, error } = await client.database
      .from('nutrition_analyses')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return { success: true, data };
  },

  deleteAnalysis: async (id) => {
    const { error } = await client.database
      .from('nutrition_analyses')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  },
};
