import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // We set "isAuthenticated" to true by default so you can see your pages!
  const [user, setUser] = useState({ id: 'test-user', name: 'Moreki Admin', email: 'admin@moreki.co.za' });
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState({ id: 'moreki-app', public_settings: {} });

  const logout = () => {
    console.log("Logout clicked - In 'Mock Mode' this does nothing.");
    setIsAuthenticated(false);
  };

  const navigateToLogin = () => {
    console.log("Redirect to login triggered.");
  };

  const checkAppState = async () => {
    // This now does nothing to prevent Base44 errors
    return true;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
