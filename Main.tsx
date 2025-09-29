import React, { useEffect, useState } from 'react';
import App from './App';
import { TelegramUser } from './types';

// Расширяем интерфейс Window для TypeScript
declare global {
  interface Window {
    Telegram: any;
  }
}

const Main: React.FC = () => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand(); // Разворачиваем приложение на весь экран

      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      } else {
        // Это для отладки в браузере, если вы хотите работать вне Telegram
        console.warn("Telegram user data not found. Using mock user for development.");
        setUser({
            id: 12345678,
            first_name: 'Local Dev',
            username: 'localdev',
            auth_date: Math.floor(Date.now() / 1000),
            hash: 'mock_hash_for_dev'
        });
      }
    } else {
       setError("Это приложение предназначено для запуска внутри Telegram.");
    }
  }, []);

  if (error) {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="text-center bg-red-900/50 p-8 rounded-lg">
                <h1 className="text-2xl font-bold text-red-400">Ошибка</h1>
                <p className="text-gray-300 mt-2">{error}</p>
            </div>
        </div>
      );
  }

  if (!user) {
    // Можно добавить красивый лоадер
    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
            <p>Загрузка данных пользователя...</p>
        </div>
    );
  }

  return <App user={user} />;
};

export default Main;
