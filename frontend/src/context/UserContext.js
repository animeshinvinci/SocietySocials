import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('societysocials_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        // Refresh user data from server
        refreshUser(parsed.id);
      } catch (e) {
        localStorage.removeItem('societysocials_user');
      }
    }
    setIsLoading(false);
  }, []);

  const refreshUser = async (userId) => {
    try {
      const response = await axios.get(`${API}/users/${userId}`);
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('societysocials_user', JSON.stringify(userData));
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  const login = async (mobileNumber) => {
    const response = await axios.post(`${API}/auth/login`, { mobile_number: mobileNumber });
    const { user: userData, is_new } = response.data;
    setUser(userData);
    localStorage.setItem('societysocials_user', JSON.stringify(userData));
    return { user: userData, isNew: is_new };
  };

  const loginDemo = async () => {
    const response = await axios.post(`${API}/auth/demo`);
    const { user: userData } = response.data;
    setUser(userData);
    localStorage.setItem('societysocials_user', JSON.stringify(userData));
    return { user: userData, isDemo: true };
  };

  const selectSociety = async (societyId) => {
    if (!user) return;
    const response = await axios.put(`${API}/users/${user.id}/society`, { society_id: societyId });
    const updatedUser = { ...user, society_id: societyId };
    setUser(updatedUser);
    localStorage.setItem('societysocials_user', JSON.stringify(updatedUser));
    return response.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('societysocials_user');
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, loginDemo, selectSociety, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
