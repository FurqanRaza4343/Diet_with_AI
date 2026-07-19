import { createClient } from '@insforge/sdk';

const client = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_URL,
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY,
  functionsUrl: '/functions',
});

export default client;
