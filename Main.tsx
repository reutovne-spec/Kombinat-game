import React, { useEffect, useState } from 'react';
import App from './App';
import { TelegramUser } from './types';
import { supabase, supabaseJwtSecret } from './lib/supabaseClient';

declare global {
  interface Window {
    Telegram: any;
  }
}

// Helper to create a JWT using the Web Crypto API
const createJwt = async (payload: object, secret: string): Promise<string> => {
  const header = { alg: 'HS256', typ: 'JWT' };

  // URL-safe Base64 encoding
  const encode = (data: string) => btoa(data).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const encodedHeader = encode(JSON.stringify(header));
  const encodedPayload = encode(JSON.stringify(payload));

  const data = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  
  // Convert ArrayBuffer to Base64 URL string
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${data}.${encodedSignature}`;
};


const Main: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'error'>('loading');
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const authenticate = async (tgUser: TelegramUser) => {
      if (!supabaseJwtSecret || supabaseJwtSecret === 'YOUR_SUPER_SECRET_JWT_SECRET_HERE') {
        console.error("Supabase JWT secret not configured in lib/supabaseClient.ts");
        setAuthStatus('error');
        return;
      }

      try {
        // The 'sub' (subject) claim becomes the user's ID in Supabase RLS policies (`auth.uid()`)
        const payload = {
          sub: tgUser.id.toString(),
          role: 'authenticated',
          // Add expiration to the token to make it valid for 24 hours
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), 
        };
        
        const jwt = await createJwt(payload, supabaseJwtSecret);
        
        // FIX: The `signInWithJwt` method is deprecated in newer versions of supabase-js.
        // Replaced with `setSession` which takes an access_token.
        const { error } = await supabase.auth.setSession({ access_token: jwt });
        
        if (error) throw error;

        setUser(tgUser);
        setAuthStatus('authenticated');
      } catch (error) {
        console.error("Authentication failed:", error);
        setAuthStatus('error');
      }
    };
    
    const tg = window.Telegram?.WebApp;
    
    const mockUser = {
      id: 987654321,
      first_name: 'Browser Dev',
      username: 'browser_dev',
      auth_date: Math.floor(Date.now() / 1000),
      hash: 'mock_hash_for_dev'
    };

    const userToAuth = tg?.initDataUnsafe?.user || mockUser;

    if (tg) {
      tg.ready();
      tg.expand();
    } else {
        console.warn("Telegram App context not found. Running in browser mode with mock user.");
    }
    
    authenticate(userToAuth);
  }, []);

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-xl animate-pulse">Аутентификация...</p>
      </div>
    );
  }

  if (authStatus === 'error' || !user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4 text-center">
        <div>
            <p className="text-xl text-red-400 font-bold">Ошибка аутентификации</p>
            <p className="text-gray-400 mt-2">Не удалось войти. Проверьте настройки Supabase JWT или обновите страницу.</p>
        </div>
      </div>
    );
  }

  return <App user={user} />;
};

export default Main;