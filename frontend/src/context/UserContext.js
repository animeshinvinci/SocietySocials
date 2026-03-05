import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSociety, setCurrentSociety] = useState(null);
  const [originalSocietyId, setOriginalSocietyId] = useState(null);
  const [isViewingDemo, setIsViewingDemo] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('societysocials_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setOriginalSocietyId(parsed.society_id);
        refreshUser(parsed.id);
      } catch (e) {
        localStorage.removeItem('societysocials_user');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user?.society_id) {
      fetchSociety(user.society_id);
    }
  }, [user?.society_id]);

  const fetchSociety = async (societyId) => {
    try {
      const response = await axios.get(`${API}/societies/${societyId}`);
      setCurrentSociety(response.data);
    } catch (e) {
      console.error('Failed to fetch society:', e);
    }
  };

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
    setOriginalSocietyId(userData.society_id);
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
    setOriginalSocietyId(societyId);
    setIsViewingDemo(false);
    localStorage.setItem('societysocials_user', JSON.stringify(updatedUser));
    return response.data;
  };

  const viewDemoSociety = async () => {
    try {
      const response = await axios.get(`${API}/societies/demo/info`);
      const demoSociety = response.data;
      setCurrentSociety(demoSociety);
      setUser(prev => ({ ...prev, society_id: demoSociety.id }));
      setIsViewingDemo(true);
      return demoSociety;
    } catch (e) {
      console.error('Failed to get demo society:', e);
      throw e;
    }
  };

  const returnToOwnSociety = async () => {
    if (originalSocietyId) {
      setUser(prev => ({ ...prev, society_id: originalSocietyId }));
      setIsViewingDemo(false);
      await fetchSociety(originalSocietyId);
    }
  };

  const updatePersona = async (newName) => {
    if (!user) return;
    const response = await axios.put(`${API}/users/${user.id}/persona`, { persona_name: newName });
    const updatedUser = { ...user, persona_name: newName };
    setUser(updatedUser);
    localStorage.setItem('societysocials_user', JSON.stringify(updatedUser));
    return response.data;
  };

  const logout = () => {
    setUser(null);
    setCurrentSociety(null);
    setOriginalSocietyId(null);
    setIsViewingDemo(false);
    localStorage.removeItem('societysocials_user');
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      isLoading, 
      currentSociety,
      isViewingDemo,
      login, 
      loginDemo, 
      selectSociety, 
      logout, 
      refreshUser,
      updatePersona,
      viewDemoSociety,
      returnToOwnSociety
    }}>
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
