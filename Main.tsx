

import React, { useEffect, useState } from 'react';
import App from './App';
import { TelegramUser } from './types';
import { supabase, supabaseJwtSecret } from './lib/supabaseClient';

declare global {
  interface Window {
    Telegram: any;
  }
}

// Helper to decode Base64 string to Uint8Array
const base64ToUint8Array = (base64: string) => {
    const binaryString = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

// Helper to create a JWT using the Web Crypto API, following RFC 7519 standards.
const createJwt = async (payload: object, secret: string): Promise<string> => {
  const header = { alg: 'HS256', typ: 'JWT' };

  // Converts an ArrayBuffer to a Base64URL-encoded string.
  const arrayBufferToBase64Url = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
  };

  // Converts a string to a Base64URL-encoded string.
  const stringToBase64Url = (str: string): string => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    return arrayBufferToBase64Url(data);
  };
  
  const encodedHeader = stringToBase64Url(JSON.stringify(header));
  const encodedPayload = stringToBase64Url(JSON.stringify(payload));

  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const decodedSecret = base64ToUint8Array(secret);

  const key = await crypto.subtle.importKey(
    'raw',
    decodedSecret,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(dataToSign));
  
  const encodedSignature = arrayBufferToBase64Url(signature);

  return `${dataToSign}.${encodedSignature}`;
};


const Main: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'error'>('loading');
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const authenticate = async (tgUser: TelegramUser) => {
      if (!supabaseJwtSecret) {
        console.error("Supabase JWT secret not configured in lib/supabaseClient.ts");
        setAuthStatus('error');
        return;
      }

      try {
        const payload = {
          sub: crypto.randomUUID(), 
          tg_user_id: tgUser.id,
          role: 'authenticated',
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hour expiration
        };
        
        const jwt = await createJwt(payload, supabaseJwtSecret);
        
        // FIX: The `setSession` method requires both an `access_token` and a `refresh_token`.
        // Since we are using a custom JWT and re-authenticating on each app load,
        // we don't have a traditional refresh token. We can pass the JWT itself
        // to satisfy the type requirement. The client won't be able to refresh the token,
        // but it's not needed for this app's authentication flow.
        const { error } = await supabase.auth.setSession({ access_token: jwt, refresh_token: jwt });
        
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
