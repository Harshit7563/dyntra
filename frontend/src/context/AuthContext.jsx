import { createContext, useContext, useState, useEffect } from 'react';
import { fetchMe } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('dyntra-token'));
  const [loading, setLoading] = useState(!!localStorage.getItem('dyntra-token'));

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    localStorage.setItem('dyntra-token', token);
    fetchMe(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('dyntra-token');
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
  };

  const logout = () => {
    localStorage.removeItem('dyntra-token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
