import client from '../lib/insforge';

export const authService = {
  register: async ({ name, email, password }) => {
    const { data, error } = await client.auth.signUp({ email, password, name });
    if (error) throw error;
    if (!data.accessToken) {
      return { success: true, message: 'Verification email sent. Check your inbox.' };
    }
    const { data: profile, error: profileError } = await client.database
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    if (profileError && profileError.code !== 'PGRST116') console.warn('Profile fetch:', profileError);
    return {
      success: true,
      token: data.accessToken,
      user: { id: data.user.id, email: data.user.email, name, ...(profile || {}) },
    };
  },

  login: async ({ email, password }) => {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const { data: profile, error: profileError } = await client.database
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    if (profileError && profileError.code !== 'PGRST116') console.warn('Profile fetch:', profileError);
    return {
      success: true,
      token: data.accessToken,
      user: { id: data.user.id, email: data.user.email, ...(profile || {}) },
    };
  },

  loginWithGoogle: async () => {
    /*
     * Google OAuth Setup (required once):
     * 1. Go to https://console.cloud.google.com/apis/credentials
     * 2. Create OAuth 2.0 Client ID (Web application)
     * 3. Add Authorized redirect URI:
     *    https://pgsu6gg6.ap-southeast.insforge.app/auth/v1/callback
     *    AND ${import.meta.env.VITE_DEPLOY_URL || window.location.origin}/auth/callback
     * 4. Copy Client ID and Client Secret
     * 5. In InsForge Dashboard → Auth → Providers → Google → paste Client ID & Secret
     */
    const { error } = await client.auth.signInWithOAuth(
      'google',
      { redirectTo: `${import.meta.env.VITE_DEPLOY_URL || window.location.origin}/auth/callback` },
    );
    if (error) throw error;
  },

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
        goal: data.goal || data.fitnessGoals,
        dietary_preferences: data.dietaryPreferences || [],
        allergies: data.allergies || [],
        height: data.height ? parseFloat(data.height) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        age: data.age ? parseInt(data.age) : null,
        gender: data.gender || null,
        activity_level: data.activityLevel || null,
        budget: data.budget || null,
        water_goal: data.waterGoal ? parseInt(data.waterGoal) : null,
        weight_goal: data.weightGoal ? parseFloat(data.weightGoal) : null,
        language: data.language || null,
        notifications: data.notifications ?? null,
        email_updates: data.emailUpdates ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    return { success: true, user: { id: user.id, email: user.email, ...profile } };
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    const { data: { user } } = await client.auth.getCurrentUser();
    if (!user?.email) throw new Error('Not authenticated');
    const { error: signInError } = await client.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (signInError) throw new Error('Current password is incorrect');
    const { error: updateError } = await client.auth.updateUser({ password: newPassword });
    if (updateError) throw updateError;
    return { success: true, message: 'Password changed successfully.' };
  },

  forgotPassword: async (email) => {
    const redirectTo = `${import.meta.env.VITE_DEPLOY_URL || window.location.origin}/reset-password`;
    const { error } = await client.auth.sendResetPasswordEmail({ email, redirectTo });
    if (error) throw error;
    return { success: true };
  },

  resetPassword: async ({ password, token }) => {
    const { error } = await client.auth.resetPassword({ newPassword: password, otp: token });
    if (error) throw error;
    return { success: true };
  },

  logout: async () => {
    const { error } = await client.auth.signOut();
    if (error) throw error;
    return { success: true };
  },
};
