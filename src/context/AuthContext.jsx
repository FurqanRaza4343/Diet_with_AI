import React, { createContext, useState, useEffect, useCallback } from 'react';
import client from '../lib/insforge';

const AuthContext = createContext();

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const SESSION_KEY = 'insforge_session_2';

const getSession = async () => {
  try {
    const mgr = client.tokenManager || client.auth?.tokenManager;
    if (mgr?.getSession) {
      const sess = mgr.getSession();
      return sess?.then ? await sess : sess;
    }
  } catch { /* ignore */ }
  try {
    const mgr = client.auth?.tokenManager;
    if (mgr?.getSession) {
      const sess = mgr.getSession();
      return sess?.then ? await sess : sess;
    }
  } catch { /* ignore */ }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const timer = setTimeout(() => {
          if (!cancelled) tryFallback();
        }, 5000);

        if (cancelled) return;

        try {
          const { data: { user: cu } } = await client.auth.getCurrentUser();
          if (cu) {
            const sess = await getSession();
            if (sess?.accessToken) {
              const tok = sess.accessToken;
              localStorage.setItem(SESSION_KEY, JSON.stringify({ accessToken: tok, user: cu }));
              client.setAccessToken(tok);
              if (!cancelled) { setToken(tok); setUser(cu); setIsAuthenticated(true); setLoading(false); }
              clearTimeout(timer);
              return;
            }
          }
        } catch { /* getCurrentUser failed */ }
        clearTimeout(timer);
      } catch { /* fall through */ }

      tryFallback();
    };

    const tryFallback = () => {
      if (cancelled) return;
      try {
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.accessToken) {
            client.setAccessToken(parsed.accessToken);
            client.auth.getCurrentUser().then(({ data: { user: v } }) => {
              if (!cancelled) {
                if (v) { setToken(parsed.accessToken); setUser(v); setIsAuthenticated(true); }
                else localStorage.removeItem(SESSION_KEY);
                setLoading(false);
              }
            }).catch(() => {
              if (!cancelled) { localStorage.removeItem(SESSION_KEY); setLoading(false); }
            });
            return;
          }
        }
      } catch { /* ignore */ }
      if (!cancelled) setLoading(false);
    };

    init();

    const unsub = client.auth.onAuthStateChange(async (event) => {
      if (event === 'signedOut' || event?.type === 'signedOut') {
        localStorage.removeItem(SESSION_KEY);
        setToken(null); setUser(null); setIsAuthenticated(false);
      } else if (event === 'signedIn' || event?.type === 'signedIn') {
        const sess = await getSession();
        if (sess?.accessToken) {
          const u = { id: sess.user?.id, email: sess.user?.email, ...(sess.user?.profile || {}) };
          localStorage.setItem(SESSION_KEY, JSON.stringify({ accessToken: sess.accessToken, user: u }));
          client.setAccessToken(sess.accessToken);
          setToken(sess.accessToken); setUser(u); setIsAuthenticated(true);
        }
      }
    });

    return () => {
      cancelled = true;
      if (typeof unsub === 'function') unsub();
      else if (unsub?.then) unsub.then(fn => fn());
    };
  }, []);

  const login = useCallback((newToken, userData) => {
    if (!newToken || !userData) return;
    localStorage.setItem(SESSION_KEY, JSON.stringify({ accessToken: newToken, user: userData }));
    client.setAccessToken(newToken);
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    try { await client.auth.signOut(); } catch { /* ignore */ }
    localStorage.removeItem(SESSION_KEY);
    client.setAccessToken(null);
    setToken(null); setUser(null); setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
