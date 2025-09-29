import React, { useEffect, useRef } from 'react';
import { TelegramUser } from '../types';

interface LoginProps {
  onLogin: (user: TelegramUser) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const telegramLoginRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // IMPORTANT: Replace 'YOUR_BOT_USERNAME_HERE' with your actual bot username
    const botUsername = 'kombinatgame_bot';

    // Assign the callback function to the window object
    (window as any).onTelegramAuth = (user: TelegramUser) => {
      onLogin(user);
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    telegramLoginRef.current?.appendChild(script);

    return () => {
      // Clean up the script and the global callback function
      telegramLoginRef.current?.removeChild(script);
      delete (window as any).onTelegramAuth;
    };
  }, [onLogin]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre-v2.png')] opacity-5"></div>
      <div className="text-center bg-gray-800/50 backdrop-blur-md rounded-2xl p-12 shadow-2xl border border-gray-700 animate-fade-in-down">
        <header className="text-center mb-8">
          <h1 className="text-6xl font-extrabold text-yellow-400 tracking-wider uppercase" style={{ textShadow: '0 0 10px rgba(250, 204, 21, 0.5)' }}>
            Комбинат
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Войдите, чтобы начать свою смену.</p>
        </header>
        <div ref={telegramLoginRef} className="flex justify-center">
          {/* Telegram Login Widget will be injected here */}
        </div>
        <p className="text-xs text-gray-500 mt-6 max-w-xs mx-auto">
          Авторизуясь, вы соглашаетесь с тем, что ваш никнейм и аватар в Telegram будут видны другим игрокам в списках лидеров.
        </p>
      </div>
       <footer className="absolute bottom-4 text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Корпорация "ТяжПромСталь". Все права защищены.</p>
      </footer>
    </div>
  );
};

export default Login;
