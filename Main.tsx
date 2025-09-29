import React, { useEffect, useState } from 'react';
import App from './App';
import { TelegramUser } from './types';

declare global {
  interface Window {
    Telegram: any;
  }
}

const Main: React.FC = () => {
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    
    // Создаем тестового пользователя для разработки в браузере
    const mockUser = {
      id: 987654321,
      first_name: 'Browser Dev',
      username: 'browser_dev',
      auth_date: Math.floor(Date.now() / 1000),
      hash: 'mock_hash_for_dev'
    };

    if (tg) {
      tg.ready();
      tg.expand();
      if (tg.initDataUnsafe?.user) {
        // Используем реальные данные из Telegram
        setUser(tg.initDataUnsafe.user);
      } else {
        // Используем тестовые данные, если приложение в Telegram, но данных нет
        console.warn("Telegram user data not found. Using mock user.");
        setUser(mockUser);
      }
    } else {
      // Используем тестовые данные, если приложение запущено не в Telegram
      console.warn("Telegram App context not found. Running in browser mode with mock user.");
      setUser(mockUser);
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-xl animate-pulse">Загрузка данных пользователя...</p>
      </div>
    );
  }

  return <App user={user} />;
};

export default Main;