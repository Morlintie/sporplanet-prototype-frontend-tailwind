import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const storedAuth = localStorage.getItem('sporplanet_auth');
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          setIsAuthenticated(true);
          setUser(authData.user);
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
        localStorage.removeItem('sporplanet_auth');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = (userData) => {
    const authData = {
      user: userData,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('sporplanet_auth', JSON.stringify(authData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('sporplanet_auth');
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    const authData = {
      user: updatedUserData,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('sporplanet_auth', JSON.stringify(authData));
    setUser(updatedUserData);
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}