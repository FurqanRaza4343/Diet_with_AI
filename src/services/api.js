import axios from 'axios';
import client from '../lib/insforge';

const API_URL = import.meta.env.VITE_INSFORGE_URL || 'https://pgsu6gg6.ap-southeast.insforge.app';

const api = axios.create({
  baseURL: `${API_URL}/rest/v1`,
  headers: {
    'Content-Type': 'application/json',
    'apikey': import.meta.env.VITE_INSFORGE_ANON_KEY,
  },
});

api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await client.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      client.auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
