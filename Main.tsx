import React, { useState, useEffect, useCallback } from 'react';
import App from './App';
import Login from './components/Login';
import { TelegramUser } from './types';

const Main: React.FC = () => {
  const [user, setUser] = useState<TelegramUser | null>(() => {
    const savedUser = localStorage.getItem('kombinat_currentUser');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      return null;
    }
  });

  const handleLogin = useCallback((telegramUser: TelegramUser) => {
    localStorage.setItem('kombinat_currentUser', JSON.stringify(telegramUser));
    setUser(telegramUser);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('kombinat_currentUser');
    setUser(null);
  }, []);

  if (user) {
    return <App user={user} onLogout={handleLogout} />;
  }

  return <Login onLogin={handleLogin} />;
};

export default Main;
