import React from 'react';
import { TelegramUser } from '../types';

interface UserProfileProps {
  user: TelegramUser;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const defaultAvatar = 'https://telegram.org/img/t_logo.png';

  return (
    <div className="absolute top-5 left-5 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-lg px-4 py-2 shadow-lg flex items-center gap-3">
      <img
        src={user.photo_url || defaultAvatar}
        alt={user.first_name}
        className="h-10 w-10 rounded-full border-2 border-gray-600"
      />
      <div>
        <p className="font-bold text-white leading-tight">{user.first_name}</p>
        {user.username && <p className="text-xs text-gray-400">@{user.username}</p>}
      </div>
    </div>
  );
};

export default UserProfile;