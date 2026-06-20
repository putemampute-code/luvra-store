import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, loginUser, registerUser, logoutUser, getUserProfile } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const user = await loginUser(email, password);
    setUserProfile(user);
    setCurrentUser(user);
    return user;
  };

  const register = async (email, password, name) => {
    const user = await registerUser(email, password, name);
    setUserProfile(user);
    setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setUserProfile(null);
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    login,
    register,
    logout,
    isAdmin: userProfile?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
