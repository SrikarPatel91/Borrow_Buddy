import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = ({ title, subtitle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Friend';
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="header-bar">
      <div>
        <h1 className="header-greeting-title">
          {title || `${getGreeting()}, ${firstName}!`}
        </h1>
        <p className="header-greeting-sub">
          {subtitle || "Here's what's happening with your shared items."}
        </p>
      </div>

      <div className="user-profile-pill" onClick={() => navigate('/profile')}>
        <div className="user-avatar-circle">{initial}</div>
        <span className="user-profile-name">{user?.name || 'User'}</span>
      </div>
    </header>
  );
};

export default Header;
